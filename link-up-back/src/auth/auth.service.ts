import {
    Injectable,
    InternalServerErrorException,
    Logger,
    OnModuleInit,
    UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';
import * as bcrypt from 'bcrypt';
import { Neo4jService } from '../common/neo4j/neo4j.service';
import { RegisterDto } from './dto/register.dto';
import { User } from '@prisma/client';
import { LoginDto } from './dto/login.dto';
import { JWT_CONSTANTS } from '../config/jwt.constants';
import { sign } from 'jsonwebtoken';
import { CryptoService } from '../common/crypto/crypto.service';
import {RefreshTokenDto} from "./dto/refresh-token.dto";
import * as jwt from 'jsonwebtoken';


@Injectable()
export class AuthService implements OnModuleInit {
    readonly logger = new Logger(AuthService.name);

    constructor(
        private prisma: PrismaService,
        private neo4j: Neo4jService,
        private redis: RedisService,
        private crypto: CryptoService,
    ) {}

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
    async rollbackOperations(userId: string) {
        try {
            await this.prisma.user.delete({ where: { id: userId } });
            await this.neo4j.executeQuery(`MATCH (u:User {id: $id}) DELETE u`, {
                id: userId,
            });
            await this.redis.deleteKey(`user:${userId}`);
        } catch (rollbackError) {
            this.logger.error('Rollback failed during transaction');
        }
    }

    async register(dto: RegisterDto) {
        let user;
        try {
            this.logger.log('Starting registration process for user: ' + dto.username);
            const hashedPassword = await bcrypt.hash(dto.password, 10);
            const encryptedData = await this.encryptUserData(dto);
            this.logger.log('Encrypted user data for registration: ', encryptedData);

            user = await this.prisma.user.create({
                data: {
                    ...encryptedData,
                    password: hashedPassword,
                },
            });

            try {
                await this.neo4j.executeQuery(
                    `CREATE (u:User {id: $id, emailHash: $emailHash})`,
                    {
                        id: user.id,
                        emailHash: encryptedData.emailHash,
                    },
                );
            } catch (neo4jError) {
                this.logger.error('Failed to insert user into Neo4j, rolling back...');
                await this.rollbackOperations(user.id);
                throw new InternalServerErrorException('Registration failed due to database inconsistency.');
            }

            await this.cacheUserData(user);
            this.logger.log('User registration successful for: ' + user.username);
            return this.generateTokens(user);
        } catch (error) {
            if (user) {
                await this.rollbackOperations(user.id);
            }
            this.logger.error(`Registration failed for user: ${dto.username}`);
            throw new InternalServerErrorException('Registration failed. Please try again later.');
        }
    }

    private async encryptUserData(dto: RegisterDto) {
        try {
            return {
                emailHash: this.crypto.deterministicEncrypt(dto.email),
                firstName: this.crypto.deterministicEncrypt(dto.firstName),
                lastName: this.crypto.deterministicEncrypt(dto.lastName),
                username: this.crypto.deterministicEncrypt(dto.username),
            };
        } catch (error) {
            this.logger.error('Error encrypting user data');
            throw new InternalServerErrorException('Error encrypting user data');
        }
    }

    async cacheUserData(user: User) {
        try {
            const decryptedUser = {
                email: this.crypto.decrypt(user.emailHash),
                firstName: this.crypto.decrypt(user.firstName),
                lastName: this.crypto.decrypt(user.lastName),
                username: this.crypto.decrypt(user.username),
            };

            await this.redis.setValue(
                `user:${user.id}`,
                JSON.stringify(decryptedUser),
                3600
            );
            this.logger.log('Cached user data for: ' + user.username);
        } catch (error) {
            this.logger.error('Error caching user data');
        }
    }

    async login(dto: LoginDto) {
        try {
            this.logger.log('Starting login process for email: ' + dto.email);
            const emailHash = this.crypto.deterministicEncrypt(dto.email);
            this.logger.log('Encrypted email hash for login: ' + emailHash);

            const user = await this.prisma.user.findUnique({
                where: { emailHash: emailHash },
            });

            if (!user) {
                this.logger.warn('Login failed: Invalid email or user not found for email: ' + dto.email);
                throw new UnauthorizedException('Invalid credentials');
            }

            const isPasswordValid = await bcrypt.compare(dto.password, user.password);
            const isEmailValid = await this.verifyEmail(user.emailHash, dto.email);

            if (!isPasswordValid || !isEmailValid) {
                this.logger.warn('Login failed: Invalid password or email mismatch for email: ' + dto.email);
                throw new UnauthorizedException('Invalid credentials');
            }

            this.logger.log('Login successful for email: ' + dto.email);
            return this.generateTokens(user);
        } catch (error) {
            this.logger.error(`Login failed for email: ${dto.email}`);
            throw new UnauthorizedException('Invalid credentials');
        }
    }

    private async verifyEmail(encryptedEmail: string, plainEmail: string) {
        try {
            const decryptedEmail = this.crypto.decrypt(encryptedEmail);
            return decryptedEmail === plainEmail;
        } catch (error) {
            this.logger.error('Email decryption failed');
            return false;
        }
    }

    async generateTokens(user: User) {
        try {
            this.logger.log('Generating tokens for user: ' + user.username);
            const accessToken = this.generateAccessToken(user);
            const refreshToken = this.generateRefreshToken(user);

            const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
            await this.prisma.user.update({
                where: { id: user.id },
                data: { refreshToken: hashedRefreshToken },
            });

            await this.redis.setValue(`access:${user.id}`, accessToken, 900);
            this.logger.log('Tokens generated and stored for user: ' + user.username);
            return { accessToken, refreshToken };
        } catch (error) {
            this.logger.error('Token generation failed for user: ' + user.username);
            throw new InternalServerErrorException('Token generation failed. Please try again later.');
        }
    }

    private generateAccessToken(user: User) {
        try {
            const payload = { sub: user.id };
            return sign(
                payload,
                process.env.JWT_ACCESS_SECRET!,
                { expiresIn: JWT_CONSTANTS.ACCESS_EXPIRES_IN },
            );
        } catch (error) {
            this.logger.error('Access token generation failed for user: ' + user.username);
            throw new InternalServerErrorException('Error generating access token');
        }
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
            await this.cacheUserData(user);
            return user;
        } catch (error) {
            this.logger.error('Error finding user by ID');
            throw new InternalServerErrorException('Error finding user');
        }
    }

    private generateRefreshToken(user: User) {
        try {
            const payload = { sub: user.id };
            return sign(
                payload,
                process.env.JWT_REFRESH_SECRET!,
                { expiresIn: JWT_CONSTANTS.REFRESH_EXPIRES_IN },
            );
        } catch (error) {
            this.logger.error('Refresh token generation failed for user: ' + user.username);
            throw new InternalServerErrorException('Error generating refresh token');
        }
    }
    private decodeRefreshToken(refreshToken: string): any {
        try {
            return jwt.decode(refreshToken);
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }
    private isRefreshTokenExpired(refreshToken: string): boolean {
        const decoded = this.decodeRefreshToken(refreshToken);
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime;
    }

    async refreshToken(dto: RefreshTokenDto) {
        try {
            this.logger.log('Starting refreshToken process');
            const decoded = this.decodeRefreshToken(dto.refreshToken);
            const user = await this.prisma.user.findUnique({
                where: { id: decoded.sub },
            });

            if (!user || !user.refreshToken) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            const isValid = await bcrypt.compare(dto.refreshToken, user.refreshToken);
            if (!isValid || this.isRefreshTokenExpired(dto.refreshToken)) {
                throw new UnauthorizedException('Invalid or expired refresh token');
            }

            const accessToken = this.generateAccessToken(user);
            await this.redis.setValue(`access:${user.id}`, accessToken, 900);
            return { accessToken };
        } catch (error) {
            this.logger.error('Refresh token failed');
            throw new UnauthorizedException('Refresh token validation failed');
        }
    }
}