import {
    BadRequestException, ConflictException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
    OnModuleInit
} from "@nestjs/common";
import {PrismaService} from "../common/prisma/prisma.service";
import {Neo4jService} from "../common/neo4j/neo4j.service";
import {RedisService} from "../common/redis/redis.service";
import {CryptoService} from "../common/crypto/crypto.service";
import {RequestAccessTokenDto} from "./dto/request.accessToken.dto";
import {PrismaClientKnownRequestError} from "@prisma/client/runtime/client";
import {User} from "@prisma/client";
import {AuthService} from "../auth/auth.service";
import {UserDataDto} from "./dto/userData.dto";


@Injectable()
export class UserService implements OnModuleInit {
    readonly logger = new Logger(UserService.name);

    constructor(
        private prisma: PrismaService,
        private neo4j: Neo4jService,
        private redis: RedisService,
        private crypto: CryptoService,
        private authService: AuthService,
    ) {}
    private userSockets = new Map<string, string[]>();
    private userDataMap = new Map<string, UserDataDto>();

    onModuleInit() {
        this.checkEnvVariables();
    }

    async addConnectedUser(userId: string, socketId: string) {
        try {
            let data: UserDataDto;
            const cachedData = await this.redis.getValue(`user:${userId}`);
            if (cachedData) {
                data = JSON.parse(cachedData);
            }
            else {
                const user = await this.prisma.user.findUnique({
                    where: { id: userId },
                    select: { firstName: true, lastName: true, username: true }
                });

                console.log("User fetched:", user);

                if (!user) {
                    this.logger.warn(`User not found: ${userId}`);
                    throw new NotFoundException("User not found");
                }

                data = {
                    ...user,
                    firstName: this.crypto.decrypt(user.firstName),
                    lastName: this.crypto.decrypt(user.lastName),
                    username: this.crypto.decrypt(user.username),
                };

                await this.redis.setValue(`user:${userId}`, JSON.stringify(data), 3600);
            }

            const sockets = this.userSockets.get(userId) || [];
            if (!sockets.includes(socketId)) {
                sockets.push(socketId);
            }
            this.userSockets.set(userId, sockets);

            this.userDataMap.set(userId, data);

            this.logger.log(`User ${userId} connected (${sockets.length} sockets)`);
        }
        catch (error) {
            if (error instanceof NotFoundException) throw error;
            this.logger.error(`Connection error for user ${userId}: ${error.message}`);
            throw new InternalServerErrorException(error.message);
        }
    }
    removeConnectedUser(socketId: string) {
        let targetUserId: string | undefined;
        for (const [userId, sockets] of this.userSockets.entries()) {
            if (sockets.includes(socketId)) {
                targetUserId = userId;
                break;
            }
        }

        if (!targetUserId) return;

        const updatedSockets = this.userSockets.get(targetUserId)?.filter(id => id !== socketId) || [];

        if (updatedSockets.length === 0) {
            this.userSockets.delete(targetUserId);
            this.userDataMap.delete(targetUserId);
            console.log(`User ${targetUserId} removed. Current users:`, this.getConnectedUsers());
        } else {
            this.userSockets.set(targetUserId, updatedSockets);
        }

        this.logger.log(`User ${targetUserId} disconnected (${updatedSockets.length} sockets left)`);
    }



    getConnectedUsers() {
        return Array.from(this.userDataMap.entries()).map(([userId, data]) => ({
            id: userId,
            ...data
        }));
    }

    async findById(userId: string): Promise<User | null> {
        try {
            const cachedUser = await this.redis.getValue(`user:${userId}`);
            if (cachedUser) {
                this.logger.log(`User found in Redis: ${userId}`);
                return JSON.parse(cachedUser);
            }

            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                this.logger.warn(`User not found in PostgreSQL: ${userId}`);
                return null;
            }
            await this.authService.cacheUserData(user);
            return user;
        } catch (error) {
            this.logger.error('Error finding user by ID');
            throw new InternalServerErrorException('Error finding user');
        }
    }

    private checkEnvVariables() {
        this.logger.log('Checking required environment variables');
        const requiredEnv = [
            'JWT_ACCESS_SECRET',
            'JWT_REFRESH_SECRET',
            'JWT_REFRESH_EXPIRES_IN',
            'JWT_ACCESS_EXPIRES_IN',
            'ENCRYPTION_KEY'
        ];

        const missingEnv = requiredEnv.filter((key) => !process.env[key]);
        if (missingEnv.length > 0) {
            const errorMessage = `Missing environment variables: ${missingEnv.join(', ')}`;
            this.logger.error(errorMessage);
            throw new Error(errorMessage);
        }
        this.logger.log('All required environment variables are present');
    }


    async info(dto: RequestAccessTokenDto) {
        this.logger.log(`Starting info retrieval for user ID: ${dto.userId}`);
        try {
            const userId = dto.userId;
            if (!userId) {
                this.logger.error('User ID is missing in request');
                throw new NotFoundException('User ID is required');
            }

            const cacheKey = `user:${userId}`;
            this.logger.debug(`Checking cache with key: ${cacheKey}`);

            const cachedUser = await this.redis.getValue(cacheKey);
            if (cachedUser) {
                const data = JSON.parse(cachedUser);
                this.logger.debug('Cache hit - Returning cached user data');
                return data;
            }

            this.logger.debug('Cache miss - Querying database');
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { firstName: true, lastName: true, username: true },
            });

            if (!user) {
                this.logger.warn(`User not found in database: ${userId}`);
                throw new NotFoundException(`User with ID ${userId} not found`);
            }

            this.logger.debug('Decrypting sensitive data');
            const decryptedUser = {
                id: userId,
                firstName: this.crypto.decrypt(user.firstName),
                lastName: this.crypto.decrypt(user.lastName),
                username: this.crypto.decrypt(user.username),
            };

            this.logger.debug('Updating cache with decrypted data');
            await this.redis.setValue(cacheKey, JSON.stringify(decryptedUser), 3600);
            return decryptedUser;
        } catch (error) {
            this.logger.error(`Info retrieval failed: ${error.message}`, error.stack);
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to retrieve user information');
        }
    }

    async updateUser(
        dto: RequestAccessTokenDto,
        updateData: Partial<{ firstName: string; lastName: string; username: string }>
    ) {
        this.logger.log(`Starting update for user ID: ${dto.userId}`);

        try {
            const userId = dto.userId;

            if (!userId) {
                this.logger.error('Missing user ID in update request');
                throw new NotFoundException('User ID is required');
            }

            if (Object.keys(updateData).length === 0) {
                this.logger.warn('Update attempted with empty payload');
                throw new NotFoundException('No update data provided');
            }

            if (updateData.username) {
                this.logger.debug(
                    `Checking username availability: ${updateData.username}`
                );
                const encryptedUsername = this.crypto.deterministicEncrypt(
                    updateData.username
                );

                const existingUser = await this.prisma.user.findFirst({
                    where: {
                        username: encryptedUsername,
                        id: { not: userId }
                    }
                });

                if (existingUser) {
                    this.logger.warn(`Username already taken: ${updateData.username}`);
                    throw new ConflictException('This username is already taken');
                }
            }

            this.logger.debug('Encrypting updated fields');
            const encryptedData: Record<string, string> = {};

            if (updateData.firstName) {
                encryptedData.firstName = await this.crypto.encrypt(updateData.firstName);
            }
            if (updateData.lastName) {
                encryptedData.lastName = await this.crypto.encrypt(updateData.lastName);
            }
            if (updateData.username) {
                encryptedData.username = await this.crypto.encrypt(updateData.username);
            }

            const updatedUser = await this.prisma.user.update({
                where: { id: userId },
                data: encryptedData,
                select: { firstName: true, lastName: true, username: true },
            });

            this.logger.debug('Decrypting updated user data');
            const decryptedUser = {
                firstName: this.crypto.decrypt(updatedUser.firstName),
                lastName: this.crypto.decrypt(updatedUser.lastName),
                username: this.crypto.decrypt(updatedUser.username),
            };

            const cacheKey = `user:${userId}`;
            this.logger.debug('Updating cache with new data');
            await this.redis.setValue(cacheKey, JSON.stringify(decryptedUser), 3600);

            return decryptedUser;
        } catch (error: PrismaClientKnownRequestError | ConflictException | BadRequestException | any) {
            if (error instanceof PrismaClientKnownRequestError) {
                this.handlePrismaError(error, dto.userId);
            }
            if (error.message.includes("Encryption")) {
                throw new InternalServerErrorException(error.message);
            }
            throw error;
        }
    }
    private handlePrismaError(error: PrismaClientKnownRequestError, userId: string) {
        this.logger.error(`Prisma error: ${error.code}`);
        if (error.code === 'P2025') {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }
        throw error;
    }


    async deleteUser(dto: RequestAccessTokenDto) {
        this.logger.log(`Starting deletion for user ID: ${dto.userId}`);
        try {
            const userId = dto.userId;
            if (!userId) {
                this.logger.error('Missing user ID in deletion request');
                throw new BadRequestException('User ID is required.');
            }

            this.logger.debug('Checking user existence');
            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                this.logger.warn(`User not found for deletion: ${userId}`);
                throw new NotFoundException(`User with ID ${userId} not found.`);
            }

            this.logger.debug('Deleting from PostgreSQL');
            await this.prisma.user.delete({ where: { id: userId } });
            this.logger.debug('Deleting from Neo4j');
            await this.neo4j.executeQuery(`
                MATCH (u:User {id: $userId})
                DETACH DELETE u
            `, { userId });

            const cacheKey = `user:${userId}`;
            this.logger.debug('Clearing cache');
            await this.redis.deleteKey(cacheKey);

            this.logger.log(`User ${userId} successfully deleted`);
            return { message: `User ${userId} deleted successfully.` };
        } catch (error) {
            this.logger.error(`Deletion failed: ${error.message}`, error.stack);

            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new InternalServerErrorException('Failed to delete user.');
        }
    }
}