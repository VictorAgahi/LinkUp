import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { Neo4jService } from '../common/neo4j/neo4j.service';
import { RedisService } from '../common/redis/redis.service';
import { CryptoService } from '../common/crypto/crypto.service';
import * as jwt from 'jsonwebtoken';
import {UserService} from "../user/user.service";

const mockUserService = {
    findById: jest.fn(),
};

const mockUser: User = {
    id: '1',
    username: 'testuser',
    password: 'hashedPassword',
    emailHash: 'emailHash',
    refreshToken: null,
    firstName: 'Test',
    lastName: 'User',
    createdAt: new Date(),
    updatedAt: new Date(),
};

const mockPrismaService = {
    user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    $transaction: jest.fn(async (callback: (prisma: any) => Promise<any>) => {
        return callback(mockPrismaService);
    }),
};

const mockNeo4jService = {
    executeQuery: jest.fn(),
};

const mockRedisService = {
    setValue: jest.fn(),
    getValue: jest.fn(),
    deleteKey: jest.fn(),
};

const mockCryptoService = {
    deterministicEncrypt: jest.fn((value: string) => value + '_encrypted'),
    decrypt: jest.fn((value: string) => value.replace('_encrypted', '')),
};


jest.mock('bcrypt', () => ({
    ...jest.requireActual('bcrypt'),
    hash: jest.fn().mockImplementation((password: string) => Promise.resolve('hashedPassword')),
    compare: jest.fn().mockImplementation((data: string, hash: string) => Promise.resolve(data === 'password')),
}));

describe('AuthService', () => {
    let service: AuthService;
    let prismaService: typeof mockPrismaService;
    let neo4jService: typeof mockNeo4jService;
    let redisService: typeof mockRedisService;
    let cryptoService: typeof mockCryptoService;
    let userService: UserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: Neo4jService, useValue: mockNeo4jService },
                { provide: RedisService, useValue: mockRedisService },
                { provide: UserService, useValue: mockUserService },
                { provide: CryptoService, useValue: mockCryptoService },
            ],
        })
            .compile();

        service = module.get<AuthService>(AuthService);
        prismaService = mockPrismaService;
        neo4jService = mockNeo4jService;
        redisService = mockRedisService;
        cryptoService = mockCryptoService;
        userService = module.get<UserService>(UserService);

        (bcrypt.hash as jest.Mock).mockClear();
        (bcrypt.compare as jest.Mock).mockClear();
        jest.spyOn(service.logger, 'error').mockImplementation(() => {});
        jest.spyOn(service.logger, 'warn').mockImplementation(() => {});
        jest.spyOn(service.logger, 'log').mockImplementation(() => {});
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('register', () => {
        it('should successfully register a user', async () => {
            const dto = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password',
                firstName: 'Test',
                lastName: 'User'
            };

            prismaService.user.create.mockResolvedValue(mockUser);
            neo4jService.executeQuery.mockResolvedValue({ records: [], summary: {} } as any);
            redisService.setValue.mockResolvedValue(true);

            const result = await service.register(dto);

            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
            expect(prismaService.user.create).toHaveBeenCalled();
            expect(neo4jService.executeQuery).toHaveBeenCalled();
        });

        it('should throw error when password hashing fails', async () => {
            const dto = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password',
                firstName: 'Test',
                lastName: 'User'
            };

            (bcrypt.hash as jest.Mock).mockRejectedValueOnce(new Error('Hashing failed'));

            await expect(service.register(dto)).rejects.toThrow(InternalServerErrorException);
        });

        it('should handle database unique constraint violation', async () => {
            const dto = {
                username: 'existingUser',
                email: 'test@example.com',
                password: 'password',
                firstName: 'Test',
                lastName: 'User'
            };

            prismaService.user.create.mockRejectedValue({
                code: 'P2002',
                meta: { target: ['email'] }
            });

            await expect(service.register(dto)).rejects.toThrow('Registration failed');
        });
    });

    describe('login', () => {
        it('should throw error for non-existent user', async () => {
            const dto = { email: 'nonexistent@example.com', password: 'password' };

            prismaService.user.findUnique.mockResolvedValue(null);

            await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
        });

        it('should detect tampered refresh token', async () => {
            const dto = { refreshToken: 'tamperedToken' };
            const userWithToken = { ...mockUser, refreshToken: await bcrypt.hash('validToken', 10) };
            prismaService.user.findUnique.mockResolvedValue(userWithToken);
            (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

            await expect(service.refreshToken(dto)).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('refreshToken', () => {
        it('should reject invalid token structure', async () => {
            const dto = { refreshToken: 'invalidToken' };

            prismaService.user.findUnique.mockResolvedValue(null);

            await expect(service.refreshToken(dto)).rejects.toThrow(UnauthorizedException);
        });

        it('should handle database error during token refresh', async () => {
            const dto = { refreshToken: 'validToken' };
            const userWithToken = { ...mockUser, refreshToken: await bcrypt.hash('validToken', 10) };

            prismaService.user.findUnique.mockRejectedValue(new Error('DB Error'));

            await expect(service.refreshToken(dto)).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('security', () => {
        it('should prevent timing attacks on login', async () => {
            const dto = { email: 'test@example.com', password: 'wrongPassword' };
            prismaService.user.findUnique.mockResolvedValue({
                ...mockUser,
                password: await bcrypt.hash('password', 10),
                emailHash: cryptoService.deterministicEncrypt('test@example.com'),
            });
            const spy = jest.spyOn(bcrypt, 'compare').mockImplementation(() =>
                new Promise(resolve => setTimeout(() => resolve(false), 100))
            );

            await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('Environment Configuration', () => {
        const originalEnv = process.env;

        afterEach(() => {
            process.env = originalEnv;
        });

        it('should throw error on missing environment variables', async () => {
            const originalEnv = process.env;
            process.env = {
                ...originalEnv,
                JWT_ACCESS_SECRET: undefined,
                ENCRYPTION_KEY: undefined
            };

            expect(() => service.onModuleInit()).toThrowError('Missing environment variables');

            process.env = originalEnv;
        }),

        it('should not throw error with valid environment', () => {
            expect(() => service.onModuleInit()).not.toThrow();
        });
    });
    describe('Data Encryption', () => {
        it('should handle encryption failures during registration', async () => {
            const dto = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password',
                firstName: 'Test',
                lastName: 'User'
            };

            cryptoService.deterministicEncrypt.mockImplementationOnce(() => {
                throw new Error('Encryption failed');
            });

            await expect(service.register(dto))
                .rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('Caching Mechanisms', () => {
        it('should handle Redis caching failures', async () => {
            const user = { ...mockUser, id: 'cache-fail' };
            redisService.setValue.mockRejectedValueOnce(new Error('Redis error'));

            await expect(service.cacheUserData(user)).resolves.toBeUndefined();
            expect(service.logger.error).toHaveBeenCalledWith('Error caching user data');
        });
    });


    describe('Token Refresh', () => {
        it('should handle expired refresh tokens', async () => {
            const expiredToken = jwt.sign(
                { sub: '1', exp: Math.floor(Date.now() / 1000) - 3600 },
                'invalid-secret'
            );

            await expect(service.refreshToken({ refreshToken: expiredToken }))
                .rejects.toThrow(UnauthorizedException);
        });

        it('should handle invalid token payloads', async () => {
            const invalidToken = jwt.sign(
                { invalid: 'payload' },
                process.env.JWT_REFRESH_SECRET!
            );

            await expect(service.refreshToken({ refreshToken: invalidToken }))
                .rejects.toThrow(UnauthorizedException);
        });
    });
    describe('Transaction Rollback', () => {
        it('should handle partial rollback failures', async () => {
            prismaService.user.delete.mockRejectedValueOnce(new Error('Delete failed'));
            neo4jService.executeQuery.mockRejectedValueOnce(new Error('Neo4j error'));
            redisService.deleteKey.mockRejectedValueOnce(new Error('Redis error'));

            await expect(service.rollbackOperations('1'))
                .resolves.toBeUndefined();
        });
    });

    describe('Email Verification', () => {
        it('should detect email decryption failures', async () => {
            const dto = { email: 'test@example.com', password: 'password' };
            const user = {
                ...mockUser,
                emailHash: 'invalid_encrypted_data'
            };

            prismaService.user.findUnique.mockResolvedValue(user);
            cryptoService.decrypt.mockImplementationOnce(() => {
                throw new Error('Decryption failed');
            });

            await expect(service.login(dto))
                .rejects.toThrow(UnauthorizedException);
        });
    });

    describe('data consistency', () => {
        it('should maintain consistency between SQL and Neo4j', async () => {
            const dto = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password',
                firstName: 'Test',
                lastName: 'User'
            };

            prismaService.user.create.mockResolvedValue(mockUser);
            neo4jService.executeQuery.mockRejectedValue(new Error('Neo4j Error'));
            prismaService.user.delete.mockResolvedValue(mockUser);

            await expect(service.register(dto)).rejects.toThrow(InternalServerErrorException);
            expect(prismaService.user.delete).toHaveBeenCalled();
        });
    });
    describe('Token Generation', () => {
        it('should handle JWT signing failures', async () => {
            const mockError = new Error('JWT signing failed');

            const accessTokenSpy = jest.spyOn(AuthService.prototype as any, 'generateAccessToken')
                .mockImplementationOnce(() => {
                    throw mockError;
                });

            await expect(service.generateTokens(mockUser))
                .rejects.toThrow(InternalServerErrorException);
            expect(accessTokenSpy).toHaveBeenCalled();

            const refreshTokenSpy = jest.spyOn(AuthService.prototype as any, 'generateRefreshToken')
                .mockImplementationOnce(() => {
                    throw mockError;
                });

            await expect(service.generateTokens(mockUser))
                .rejects.toThrow(InternalServerErrorException);
            expect(refreshTokenSpy).toHaveBeenCalled();
        });

        it('should handle database update failures', async () => {
            prismaService.user.update.mockRejectedValueOnce(new Error('DB error'));

            await expect(service.generateTokens(mockUser))
                .rejects.toThrow(InternalServerErrorException);
        });
    });
});
