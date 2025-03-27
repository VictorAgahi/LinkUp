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

@Injectable()
export class AuthService implements OnModuleInit {
    private readonly logger = new Logger(AuthService.name);

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
            'ENCRYPTION_KEY',
        ];
        const missingEnv = requiredEnv.filter((key) => !process.env[key]);

        if (missingEnv.length > 0) {
            throw new Error(
                `Missing environment variables: ${missingEnv.join(', ')}`,
            );
        }
    }

    private async rollbackOperations(userId: string) {
        try {
            await this.prisma.user.delete({ where: { id: userId } });
            await this.neo4j.executeQuery(`MATCH (u:User {id: $id}) DELETE u`, {
                id: userId,
            });
            await this.redis.deleteKey(`user:${userId}`);
        } catch (rollbackError) {
            this.logger.error('Rollback failed', rollbackError.stack);
        }
    }

    async register(dto: RegisterDto) {
        try {
            const hashedPassword = await bcrypt.hash(dto.password, 10);
            const encryptedData = await this.encryptUserData(dto);
            console.log(encryptedData);


            const user = await this.prisma.$transaction(async (prisma) => {
                const user = await prisma.user.create({
                    data: {
                        ...encryptedData,
                        password: hashedPassword,
                    },
                });

                await this.neo4j.executeQuery(
                    `CREATE (u:User {id: $id, emailHash: $emailHash})`,
                    {
                        id: user.id,
                        emailHash: encryptedData.emailHash,
                    },
                );

                return user;
            });

            await this.cacheUserData(user);
            return this.generateTokens(user);
        } catch (error) {
            this.logger.error(`Registration failed: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Registration failed');
        }
    }

    private async encryptUserData(dto: RegisterDto) {
        return {
            emailHash: this.crypto.deterministicEncrypt(dto.email),
            firstName: this.crypto.deterministicEncrypt(dto.firstName),
            lastName: this.crypto.deterministicEncrypt(dto.lastName),
            username: this.crypto.deterministicEncrypt(dto.username),
        };
    }

    private async generateEmailHash(email: string): Promise<string> {
        return bcrypt.hash(email, 10);
    }

    private async cacheUserData(user: User) {
        const decryptedUser = {
            email: this.crypto.decrypt(user.emailHash),
            firstName:  this.crypto.decrypt(user.firstName),
            lastName:  this.crypto.decrypt(user.lastName),
            username:  this.crypto.decrypt(user.username),
        };

        await this.redis.setValue(
            `user:${user.id}`,
            JSON.stringify(decryptedUser),
            3600
        );
    }

    async login(dto: LoginDto) {
        try {

            const emailHash = this.crypto.deterministicEncrypt(dto.email);
            console.log(emailHash)
            const user = await this.prisma.user.findUnique({
                where: {emailHash: emailHash},
            });



            if (!user) {
                throw new UnauthorizedException('Invalid credentials');
            }

            const isPasswordValid = await bcrypt.compare(
                dto.password,
                user.password,
            );
            const isEmailValid = await this.verifyEmail(user.emailHash, dto.email);

            if (!isPasswordValid || !isEmailValid) {
                throw new UnauthorizedException('Invalid credentials');
            }

            return this.generateTokens(user);
        } catch (error) {
            this.logger.error(`Login failed: ${error.message}`, error.stack);
            throw new UnauthorizedException('Invalid credentials');
        }
    }

    private async verifyEmail(encryptedEmail: string, plainEmail: string) {
        try {
            const decryptedEmail = this.crypto.decrypt(encryptedEmail);
            return decryptedEmail === plainEmail;
        } catch (error) {
            this.logger.error('Email decryption failed', error.stack);
            return false;
        }
    }

    private async generateTokens(user: User) {
        try {
            const accessToken = this.generateAccessToken(user);
            const refreshToken = this.generateRefreshToken(user);

            const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
            await this.prisma.user.update({
                where: { id: user.id },
                data: { refreshToken: hashedRefreshToken },
            });

            await this.redis.setValue(`access:${user.id}`, accessToken , 900);

            return { accessToken, refreshToken };
        } catch (error) {
            this.logger.error('Token generation failed', error.stack);
            throw new InternalServerErrorException('Authentication failed');
        }
    }

    private generateAccessToken(user: User) {
        return sign(
            { sub: user.id },
            process.env.JWT_ACCESS_SECRET!,
            { expiresIn: JWT_CONSTANTS.ACCESS_EXPIRES_IN },
        );
    }

    private generateRefreshToken(user: User) {
        return sign(
            { sub: user.id },
            process.env.JWT_REFRESH_SECRET!,
            { expiresIn: JWT_CONSTANTS.REFRESH_EXPIRES_IN },
        );
    }
}