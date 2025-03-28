import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import {InternalServerErrorException, NotFoundException, UnauthorizedException} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { Neo4jService } from '../common/neo4j/neo4j.service';
import { RedisService } from '../common/redis/redis.service';
import { CryptoService } from '../common/crypto/crypto.service';
import { RequestAccessTokenDto } from "./dto/request.accessToken.dto";
import {stringify} from "ts-jest";

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

// Mocks pour PrismaService, Neo4jService, RedisService et CryptoService
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
    encrypt: jest.fn((text: string) => Promise.resolve(`encrypted${text}`)),
    decrypt: jest.fn((text: string) => text.replace('encrypted', '')),
    deterministicEncrypt: jest.fn(),
};

jest.mock('bcrypt', () => ({
    ...jest.requireActual('bcrypt'),
    hash: jest.fn().mockImplementation((password: string) => Promise.resolve('hashedPassword')),
    compare: jest.fn().mockImplementation((data: string, hash: string) => Promise.resolve(data === 'password')),
}));

describe('UserService', () => {
    let service: UserService;
    let prismaService: typeof mockPrismaService;
    let neo4jService: typeof mockNeo4jService;
    let redisService: typeof mockRedisService;
    let cryptoService: typeof mockCryptoService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: Neo4jService, useValue: mockNeo4jService },
                { provide: RedisService, useValue: mockRedisService },
                { provide: CryptoService, useValue: mockCryptoService },
            ],
        }).compile();
        service = module.get<UserService>(UserService);
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
    describe('getUserInfo', () => {
        it('should return user info', async () => {
            prismaService.user.findUnique.mockResolvedValue(mockUser);

            const result = await service.info(new RequestAccessTokenDto(mockUser.id, mockUser.username));

            expect(result).toEqual({
                firstName: 'Test',
                lastName: 'User',
                username: 'testuser',
            });

            expect(prismaService.user.findUnique).toHaveBeenCalledWith({
                where: { id: mockUser.id },
                select: {
                    firstName: true,
                    lastName: true,
                    username: true,
                },
            });
        });

        it('should throw a NotFoundException if user not found', async () => {
            prismaService.user.findUnique.mockResolvedValue(null);

            await expect(service.info(new RequestAccessTokenDto("", mockUser.username)))
                .rejects
                .toThrowError(new NotFoundException(`User with ID  not found.`));
        });

        it('should return cached user info when available', async () => {
            const cachedData = {
                firstName: 'Cached',
                lastName: 'User',
                username: 'cacheduser'
            };
            redisService.getValue.mockResolvedValue(JSON.stringify(cachedData));

            const result = await service.info(new RequestAccessTokenDto('1', 'testuser'));

            expect(result).toEqual(cachedData);
            expect(prismaService.user.findUnique).not.toHaveBeenCalled();
        });

        it('should throw InternalServerErrorException when decryption fails', async () => {
            redisService.getValue.mockResolvedValue(JSON.stringify({
                firstName: 'invalid_encrypted_data',
                lastName: 'invalid_encrypted_data',
                username: 'invalid_encrypted_data'
            }));

            cryptoService.decrypt.mockImplementation(() => {
                throw new Error('Decryption failed: invalid tag');
            });

            prismaService.user.findUnique.mockResolvedValue(null);

            await expect(service.info(new RequestAccessTokenDto('1', 'testuser')))
                .rejects.toThrow(InternalServerErrorException);

            expect(cryptoService.decrypt).toHaveBeenCalledTimes(1);
        });
    });


    describe('updateUser', () => {
        it('should update user info successfully', async () => {
            const mockUser = { id: '1', username: 'testuser', firstName: 'Test', lastName: 'User' };
            const updatedUser = { ...mockUser, firstName: 'Updated' };

            const encryptedData = {
                firstName: 'encryptedUpdated',
                lastName: 'encryptedUser',
                username: 'encryptedtestuser',
            };

            const decryptedUser = {
                firstName: 'Updated',
                lastName: 'User',
                username: 'testuser',
            };

            cryptoService.encrypt.mockImplementation((text) => Promise.resolve(`encrypted${text}`));
            cryptoService.decrypt.mockImplementation((text) => text.replace('encrypted', ''));

            prismaService.user.update.mockResolvedValue(encryptedData);
            redisService.setValue.mockResolvedValue(true);

            const result = await service.updateUser(
                new RequestAccessTokenDto(mockUser.id, mockUser.username),
                { firstName: 'Updated' }
            );

            expect(result).toEqual(decryptedUser);
            expect(prismaService.user.update).toHaveBeenCalledWith({
                where: { id: mockUser.id },
                data: { firstName: 'encryptedUpdated' },
                select: { firstName: true, lastName: true, username: true },
            });
            expect(redisService.setValue).toHaveBeenCalledWith(
                `user:${mockUser.id}`,
                JSON.stringify(decryptedUser),
                3600
            );
        });

        it('should throw InternalServerErrorException if update fails', async () => {
            const mockUser = { id: '1', username: 'testuser', firstName: 'Test', lastName: 'User' };
            const errorMessage = 'Error updating user info';

            cryptoService.encrypt.mockImplementation(() => Promise.resolve('encrypted'));
            prismaService.user.update.mockRejectedValue(new Error(errorMessage));

            await expect(service.updateUser(
                new RequestAccessTokenDto(mockUser.id, mockUser.username),
                { firstName: 'Updated' }
            )).rejects.toThrow(new InternalServerErrorException('Failed to update user.'));
        });

        it('should throw InternalServerErrorException if update fails', async () => {
            const mockUser = { id: '1', username: 'testuser', firstName: 'Test', lastName: 'User' };
            const errorMessage = 'Error updating user info';

            prismaService.user.update.mockRejectedValue(new Error(errorMessage));

            await expect(service.updateUser(new RequestAccessTokenDto(mockUser.id, mockUser.username), { firstName: 'Updated' }))
                .rejects
                .toThrowError(new InternalServerErrorException('Failed to update user.'));
        });
        it('should update multiple fields when provided', async () => {
            const updateData = {
                firstName: 'NewFirst',
                lastName: 'NewLast'
            };

            cryptoService.encrypt.mockImplementation((text) =>
                Promise.resolve(`encrypted${text}`));

            prismaService.user.update.mockResolvedValue({
                firstName: 'encryptedNewFirst',
                lastName: 'encryptedNewLast',
                username: 'encryptedtestuser'
            });

            const result = await service.updateUser(
                new RequestAccessTokenDto('1', 'testuser'),
                updateData
            );

            expect(result).toEqual({
                firstName: 'NewFirst',
                lastName: 'NewLast',
                username: 'testuser'
            });
        });

        it('should handle encryption failure', async () => {
            cryptoService.encrypt.mockImplementation(() => {
                throw new Error('Encryption failed');
            });

            await expect(service.updateUser(
                new RequestAccessTokenDto('1', 'testuser'),
                { firstName: 'New' }
            )).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('deleteUser', () => {
        it('should delete a user successfully', async () => {
            const mockUser = { id: '1', username: 'testuser', firstName: 'Test', lastName: 'User' };
            prismaService.user.findUnique.mockResolvedValue(mockUser);
            neo4jService.executeQuery.mockResolvedValue({});
            redisService.deleteKey.mockResolvedValue(1);

            const result = await service.deleteUser(new RequestAccessTokenDto(mockUser.id, mockUser.username));

            expect(result).toEqual({ message: `User ${mockUser.id} deleted successfully.` });
            expect(prismaService.user.delete).toHaveBeenCalledWith({ where: { id: mockUser.id } });
            expect(neo4jService.executeQuery).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ userId: mockUser.id }));
            expect(redisService.deleteKey).toHaveBeenCalledWith(`user:${mockUser.id}`);
        });

        it('should throw NotFoundException if user is not found', async () => {
            const mockUserId = '1';
            prismaService.user.findUnique.mockResolvedValue(null);

            await expect(service.deleteUser(new RequestAccessTokenDto(mockUserId, 'testuser')))
                .rejects
                .toThrowError(new NotFoundException(`User with ID ${mockUserId} not found.`));
        });

        it('should throw InternalServerErrorException if an error occurs during deletion', async () => {
            const mockUser = { id: '1', username: 'testuser', firstName: 'Test', lastName: 'User' };
            prismaService.user.findUnique.mockResolvedValue(mockUser);
            prismaService.user.delete.mockRejectedValue(new Error('Database error'));

            await expect(service.deleteUser(new RequestAccessTokenDto(mockUser.id, mockUser.username)))
                .rejects
                .toThrowError(new InternalServerErrorException('Failed to delete user.'));
        });
        it('should handle Neo4j deletion failure', async () => {
            prismaService.user.findUnique.mockResolvedValue(mockUser);
            neo4jService.executeQuery.mockRejectedValue(new Error('Neo4j error'));

            await expect(service.deleteUser(new RequestAccessTokenDto('1', 'testuser')))
                .rejects.toThrow(InternalServerErrorException);
        });

        it('should handle Redis deletion failure', async () => {
            prismaService.user.findUnique.mockResolvedValue(mockUser);
            redisService.deleteKey.mockRejectedValue(new Error('Redis error'));

            await expect(service.deleteUser(new RequestAccessTokenDto('1', 'testuser')))
                .rejects.toThrow(InternalServerErrorException);
        });
    });
    describe('Module Initialization', () => {
        it('should throw error when required env variables are missing', () => {
            const originalEnv = process.env;
            process.env = {
                ...originalEnv,
                JWT_ACCESS_SECRET: undefined,
                ENCRYPTION_KEY: undefined
            };

            expect(() => service.onModuleInit()).toThrowError('Missing environment variables');

            process.env = originalEnv;
        });

        it('should not throw error when all env variables are present', () => {
            expect(() => service.onModuleInit()).not.toThrow();
        });
    });
    describe('Edge Cases', () => {
        it('should handle empty update in updateUser', async () => {
            const result = await service.updateUser(
                new RequestAccessTokenDto('1', 'testuser'),
                {}
            );

            expect(result).toEqual({
                firstName: 'Test',
                lastName: 'User',
                username: 'testuser'
            });
        });

        it('should handle empty update in updateUser + user not found', async () => {
            prismaService.user.findUnique.mockResolvedValue(null);

            await expect(service.updateUser(new RequestAccessTokenDto("", mockUser.username), {}))
                .rejects
                .toThrowError(new NotFoundException('Failed to update user.'));
        });

        it('should handle null cached value in info', async () => {
            redisService.getValue.mockResolvedValue(null);
            prismaService.user.findUnique.mockResolvedValue(mockUser);

            const result = await service.info(new RequestAccessTokenDto('1', 'testuser'));

            expect(result).toBeDefined();
        });
    });
});