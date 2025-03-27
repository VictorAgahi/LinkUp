import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { Neo4jService } from '../common/neo4j/neo4j.service';
import { RedisService } from '../common/redis/redis.service';
import { CryptoService } from '../common/crypto/crypto.service';


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

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: Neo4jService, useValue: mockNeo4jService },
                { provide: RedisService, useValue: mockRedisService },
                { provide: CryptoService, useValue: mockCryptoService },
            ],
        })
            .compile();

        service = module.get<AuthService>(AuthService);
        prismaService = mockPrismaService;
        neo4jService = mockNeo4jService;
        redisService = mockRedisService;
        cryptoService = mockCryptoService;

        (bcrypt.hash as jest.Mock).mockClear();
        (bcrypt.compare as jest.Mock).mockClear();
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
});
