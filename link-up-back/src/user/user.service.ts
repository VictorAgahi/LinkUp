import {Injectable, InternalServerErrorException, Logger, NotFoundException, OnModuleInit} from "@nestjs/common";
import {PrismaService} from "../common/prisma/prisma.service";
import {Neo4jService} from "../common/neo4j/neo4j.service";
import {RedisService} from "../common/redis/redis.service";
import {CryptoService} from "../common/crypto/crypto.service";
import {RequestAccessTokenDto} from "./dto/request.accessToken.dto";


@Injectable()
export class UserService implements OnModuleInit
{
    readonly logger = new Logger(UserService.name);

    constructor(
        private prisma: PrismaService,
        private neo4j: Neo4jService,
        private redis: RedisService,
        private crypto: CryptoService)
    {}

    onModuleInit() {
        this.checkEnvVariables();
    }

    private checkEnvVariables() {
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
    }

    async info(dto: RequestAccessTokenDto) {
        try {
            const userId = dto.userId;
            const cacheKey = `user:${userId}`;

            const cachedUser = await this.redis.getValue(cacheKey);
            if (cachedUser) {
                this.logger.log(`User ${userId} found in cache.`);
                try {
                    const parsedUser = JSON.parse(cachedUser);
                    // Tester le décryptage des données du cache
                    this.crypto.decrypt(parsedUser.firstName);
                    this.crypto.decrypt(parsedUser.lastName);
                    this.crypto.decrypt(parsedUser.username);
                    return parsedUser;
                } catch (error) {
                    this.logger.error(`Cached data decryption failed for user ${userId}`);
                    throw new InternalServerErrorException('Failed to decrypt cached user data');
                }
            }

            this.logger.log(`User ${userId} not in cache, querying PostgreSQL.`);
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    firstName: true,
                    lastName: true,
                    username: true,
                },
            });

            if (!user) {
                throw new NotFoundException(`User with ID ${userId} not found.`);
            }

            const decryptedUser = {
                firstName: this.crypto.decrypt(user.firstName),
                lastName: this.crypto.decrypt(user.lastName),
                username: this.crypto.decrypt(user.username),
            };

            await this.redis.setValue(cacheKey, JSON.stringify(decryptedUser), 3600);
            this.logger.log(`User ${userId} cached successfully.`);

            return decryptedUser;
        } catch (error) {
            if (error instanceof InternalServerErrorException || error instanceof NotFoundException) {
                throw error;
            }
        }
    }

    async updateUser(dto: RequestAccessTokenDto, updateData: Partial<{ firstName: string; lastName: string; username: string }>) {
        try {
            if (Object.keys(updateData).length === 0) {
                const updatedUser = await this.prisma.user.findUnique({
                    where: { id: dto.userId }});
                if (!updatedUser) {
                    throw new NotFoundException(`User with ID ${dto.userId} not found.`);
                }
                const decryptedUser = {
                    firstName: this.crypto.decrypt(updatedUser.firstName),
                    lastName: this.crypto.decrypt(updatedUser.lastName),
                    username: this.crypto.decrypt(updatedUser.username),
                };
                return decryptedUser
            }
            const userId = dto.userId;
            const cacheKey = `user:${userId}`;

            this.logger.log(`Updating user ${userId} in PostgreSQL and Neo4j.`);

            const encryptedData = {
                firstName: updateData.firstName ? await this.crypto.encrypt(updateData.firstName) : undefined,
                lastName: updateData.lastName ? await this.crypto.encrypt(updateData.lastName) : undefined,
                username: updateData.username ? await this.crypto.encrypt(updateData.username) : undefined,
            };

            const updatedUser = await this.prisma.user.update({
                where: { id: userId },
                data: encryptedData,
                select: {
                    firstName: true,
                    lastName: true,
                    username: true,
                },
            });

            const decryptedUser = {
                firstName: this.crypto.decrypt(updatedUser.firstName),
                lastName: this.crypto.decrypt(updatedUser.lastName),
                username: this.crypto.decrypt(updatedUser.username),
            };

            await this.redis.setValue(cacheKey, JSON.stringify(decryptedUser), 3600);

            this.logger.log(`User ${userId} updated successfully.`);
            return decryptedUser;
        } catch (error) {
            this.logger.error(`Error updating user`);
            throw new InternalServerErrorException('Failed to update user.');
        }
    }

    async deleteUser(dto: RequestAccessTokenDto) {
        try {
            const userId = dto.userId;
            const cacheKey = `user:${userId}`;

            this.logger.log(`Deleting user with ID ${userId} from PostgreSQL, Neo4j, and Redis.`);

            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                this.logger.error(`User with ID ${userId} not found.`);
                throw new NotFoundException(`User with ID ${userId} not found.`);
            }

            await this.prisma.user.delete({ where: { id: userId } });

            await this.neo4j.executeQuery(`
            MATCH (u:User {id: $userId})
            DETACH DELETE u
        `, { userId });

            await this.redis.deleteKey(cacheKey);

            this.logger.log(`User ${userId} deleted successfully.`);
            return { message: `User ${userId} deleted successfully.` };
        } catch (error) {
            if (error instanceof NotFoundException) {
                this.logger.error(`User Not found`);
                throw new NotFoundException(error.message);
            }
            this.logger.error(`Error deleting user`);
            throw new InternalServerErrorException('Failed to delete user.');
        }
    }

}