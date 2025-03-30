// user.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import {
    BadRequestException,
    ConflictException,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { Neo4jService } from '../common/neo4j/neo4j.service';
import { RedisService } from '../common/redis/redis.service';
import { CryptoService } from '../common/crypto/crypto.service';
import { RequestAccessTokenDto } from "./dto/request.accessToken.dto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { AuthService } from "../auth/auth.service";
import {RegisterDto} from "../auth/dto/register.dto";
import {LoginDto} from "../auth/dto/login.dto";
import {text} from "express";

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
        findFirst: jest.fn(),
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

const mockAuthService = {
    cacheUserData: jest.fn(),
    login: jest.fn((value: LoginDto) => Promise.resolve(text)),
    register: jest.fn((value: RegisterDto) => Promise.resolve(value)),
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
    let authService: typeof mockAuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: Neo4jService, useValue: mockNeo4jService },
                { provide: RedisService, useValue: mockRedisService },
                { provide: CryptoService, useValue: mockCryptoService },
                { provide: AuthService, useValue: mockAuthService },
            ],
        }).compile();
        service = module.get<UserService>(UserService);
        prismaService = mockPrismaService;
        neo4jService = mockNeo4jService;
        redisService = mockRedisService;
        cryptoService = mockCryptoService;
        authService = mockAuthService;

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

    describe('getUserInfo', () => {
        it('should return user info', async () => {
            prismaService.user.findUnique.mockResolvedValue(mockUser);

            const result = await service.info(new RequestAccessTokenDto(mockUser.id));

            expect(result).toEqual({
                id: '1',
                firstName: 'Test',
                lastName: 'User',
                username: 'testuser',
            });
        });

        it('should throw a NotFoundException if user ID is missing', async () => {
            await expect(service.info(new RequestAccessTokenDto("")))
                .rejects
                .toThrow(new NotFoundException('User ID is required'));
        });

        it('should return cached user info when available', async () => {
            const cachedData = {
                id: '1',
                firstName: 'Cached',
                lastName: 'User',
                username: 'cacheduser'
            };
            redisService.getValue.mockResolvedValue(JSON.stringify(cachedData));

            const result = await service.info(new RequestAccessTokenDto('1'));
            expect(result).toEqual(cachedData);
        });
    });

    describe('updateUser', () => {
        const mockUserId = '1';
        const mockUserData = {
            id: mockUserId,
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User'
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should update user info successfully', async () => {
            const updatedUserData = { ...mockUserData, firstName: 'Updated' };
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
                new RequestAccessTokenDto(mockUserData.id),
                { firstName: 'Updated' }
            );

            expect(result).toEqual(decryptedUser);
            expect(prismaService.user.update).toHaveBeenCalledWith({
                where: { id: mockUserData.id },
                data: { firstName: 'encryptedUpdated' },
                select: { firstName: true, lastName: true, username: true },
            });
            expect(redisService.setValue).toHaveBeenCalledWith(
                `user:${mockUserData.id}`,
                JSON.stringify(decryptedUser),
                3600
            );
        });

        it('should handle encryption failure', async () => {
            cryptoService.encrypt.mockImplementation(() => { throw new Error('Encryption failed'); });

            await expect(service.updateUser(
                new RequestAccessTokenDto('1'),
                { firstName: 'New' }
            )).rejects.toThrow(InternalServerErrorException);
        });

        it('should throw InternalServerErrorException for generic Prisma errors', async () => {
            const prismaError = new PrismaClientKnownRequestError('Database error', {
                code: 'P2002',
                clientVersion: '1.0'
            });

            prismaService.user.update.mockRejectedValue(prismaError);
            cryptoService.encrypt.mockResolvedValue('encrypted');

            await expect(service.updateUser(
                new RequestAccessTokenDto(mockUserId),
                { firstName: 'Updated' }
            )).rejects.toThrow(new InternalServerErrorException('Database error'));
        });

        it('should update multiple fields when provided', async () => {
            const updateData = {
                firstName: 'NewFirst',
                lastName: 'NewLast'
            };

            cryptoService.encrypt.mockImplementation((text) => Promise.resolve(`encrypted${text}`));
            prismaService.user.update.mockResolvedValue({
                firstName: 'encryptedNewFirst',
                lastName: 'encryptedNewLast',
                username: 'encryptedtestuser'
            });

            const result = await service.updateUser(
                new RequestAccessTokenDto('1'),
                updateData
            );

            expect(result).toEqual({
                firstName: 'NewFirst',
                lastName: 'NewLast',
                username: 'testuser'
            });
        });

        it('should throw BadRequestException when no update data provided', async () => {
            await expect(service.updateUser(
                new RequestAccessTokenDto(mockUserId),
                {}
            )).rejects.toThrow(new BadRequestException('No update data provided'));
        });

        it('should throw ConflictException when username is already taken', async () => {
            const currentUserId = '1';
            const existingUserId = '2';
            const existingUsername = 'takenusername';

            cryptoService.deterministicEncrypt.mockImplementation((text) => `encrypted${text}`);
            const encryptedUsername = cryptoService.deterministicEncrypt(existingUsername);
            const existingUser = {
                id: existingUserId,
                username: encryptedUsername,
                firstName: 'Existing',
                lastName: 'User'
            };

            prismaService.user.findFirst.mockResolvedValue(existingUser);

            await expect(service.updateUser(
                new RequestAccessTokenDto(currentUserId),
                { username: existingUsername }
            )).rejects.toThrow(new ConflictException('This username is already taken'));

            expect(cryptoService.deterministicEncrypt).toHaveBeenCalledWith(existingUsername);
            expect(prismaService.user.findFirst).toHaveBeenCalledWith({
                where: {
                    username: encryptedUsername,
                    id: { not: currentUserId }
                }
            });
        });

        it('should throw NotFoundException when user does not exist', async () => {
            const prismaError = new PrismaClientKnownRequestError('Not found', {
                code: 'P2025',
                clientVersion: '1.0'
            });

            prismaService.user.update.mockRejectedValue(prismaError);

            await expect(service.updateUser(
                new RequestAccessTokenDto(mockUserId),
                { firstName: 'Updated' }
            )).rejects.toThrow(new NotFoundException(`User with ID ${mockUserId} not found`));
        });

        it('should handle unexpected errors', async () => {
            const error = new Error('Unexpected error');
            prismaService.user.update.mockRejectedValue(error);
            cryptoService.encrypt.mockResolvedValue('encrypted');

            await expect(service.updateUser(
                new RequestAccessTokenDto(mockUserId),
                { firstName: 'Updated' }
            )).rejects.toThrow(new InternalServerErrorException('Unexpected error'));
        });
    });

    describe('deleteUser', () => {
        it('should delete a user successfully', async () => {
            const userToDelete = { id: '1', username: 'testuser', firstName: 'Test', lastName: 'User' };
            prismaService.user.findUnique.mockResolvedValue(userToDelete);
            neo4jService.executeQuery.mockResolvedValue({});
            redisService.deleteKey.mockResolvedValue(1);

            const result = await service.deleteUser(new RequestAccessTokenDto(userToDelete.id));

            expect(result).toEqual({ message: `User ${userToDelete.id} deleted successfully.` });
            expect(prismaService.user.delete).toHaveBeenCalledWith({ where: { id: userToDelete.id } });
            expect(neo4jService.executeQuery).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ userId: userToDelete.id }));
            expect(redisService.deleteKey).toHaveBeenCalledWith(`user:${userToDelete.id}`);
        });

        it('should throw NotFoundException if user is not found', async () => {
            const mockUserId = '1';
            prismaService.user.findUnique.mockResolvedValue(null);

            await expect(service.deleteUser(new RequestAccessTokenDto(mockUserId)))
                .rejects
                .toThrowError(new NotFoundException(`User with ID ${mockUserId} not found.`));
        });

        it('should throw InternalServerErrorException if an error occurs during deletion', async () => {
            const userToDelete = { id: '1', username: 'testuser', firstName: 'Test', lastName: 'User' };
            prismaService.user.findUnique.mockResolvedValue(userToDelete);
            prismaService.user.delete.mockRejectedValue(new Error('Database error'));

            await expect(service.deleteUser(new RequestAccessTokenDto(userToDelete.id)))
                .rejects
                .toThrowError(new InternalServerErrorException('Failed to delete user.'));
        });

        it('should handle Neo4j deletion failure', async () => {
            prismaService.user.findUnique.mockResolvedValue(mockUser);
            neo4jService.executeQuery.mockRejectedValue(new Error('Neo4j error'));

            await expect(service.deleteUser(new RequestAccessTokenDto('1')))
                .rejects.toThrow(InternalServerErrorException);
        });

        it('should handle Redis deletion failure', async () => {
            prismaService.user.findUnique.mockResolvedValue(mockUser);
            redisService.deleteKey.mockRejectedValue(new Error('Redis error'));

            await expect(service.deleteUser(new RequestAccessTokenDto('1')))
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
            await expect(service.updateUser(new RequestAccessTokenDto(mockUser.id), {}))
                .rejects.toThrow(new NotFoundException('No update data provided'));
        });

        it('should handle empty update in updateUser + user not found', async () => {
            prismaService.user.findUnique.mockResolvedValue(null);
            await expect(service.updateUser(new RequestAccessTokenDto(""), {}))
                .rejects.toThrow(new NotFoundException('User ID is required'));
        });
    });

    // ----------------- Tests des WebSocket Connections -----------------
    describe('WebSocket Connections', () => {
        const userId = 'user-1';
        const socketId1 = 'socket-1';
        const socketId2 = 'socket-2';

        beforeEach(() => {
            jest.clearAllMocks();
            // Réinitialisation des maps internes du service
            (service as any).userSockets = new Map();
            (service as any).userDataMap = new Map();
        });

        describe('addConnectedUser', () => {
            it('should add socket to new user', async () => {
                const userData = { firstName: 'John', lastName: 'Doe', username: 'johndoe' };
                // Simuler que Redis retourne les données de l’utilisateur
                redisService.getValue.mockResolvedValue(JSON.stringify(userData));

                await service.addConnectedUser(userId, socketId1);

                expect(redisService.getValue).toHaveBeenCalledWith(`user:${userId}`);
                expect((service as any).userSockets.get(userId)).toEqual([socketId1]);
                expect((service as any).userDataMap.get(userId)).toEqual(userData);
            });

            it('should add multiple sockets to same user', async () => {
                const userData = { firstName: 'John', lastName: 'Doe', username: 'johndoe' };
                redisService.getValue.mockResolvedValue(JSON.stringify(userData));

                await service.addConnectedUser(userId, socketId1);
                await service.addConnectedUser(userId, socketId2);

                expect((service as any).userSockets.get(userId)).toEqual([socketId1, socketId2]);
            });

            it('should handle missing user in database', async () => {
                // Pour simuler l’absence d’un utilisateur en cache ET en BDD :
                redisService.getValue.mockResolvedValue(null);
                prismaService.user.findUnique.mockResolvedValue(null);

                await expect(service.addConnectedUser(userId, socketId2))
                    .rejects
                    .toThrow(NotFoundException);
            });
        });

        describe('removeConnectedUser', () => {
            it('should remove socket from user', async () => {
                const userData = { firstName: 'John', lastName: 'Doe', username: 'johndoe' };
                redisService.getValue.mockResolvedValue(JSON.stringify(userData));

                await service.addConnectedUser(userId, socketId1);
                await service.addConnectedUser(userId, socketId2);

                service.removeConnectedUser(socketId1);

                expect((service as any).userSockets.get(userId)).toEqual([socketId2]);
                expect((service as any).userDataMap.get(userId)).toBeDefined();
            });

            it('should clear user data when last socket removed', async () => {
                const userData = { firstName: 'John', lastName: 'Doe', username: 'johndoe' };
                redisService.getValue.mockResolvedValue(JSON.stringify(userData));

                await service.addConnectedUser(userId, socketId1);
                service.removeConnectedUser(socketId1);

                expect((service as any).userSockets.has(userId)).toBe(false);
                expect((service as any).userDataMap.has(userId)).toBe(false);
            });

            it('should do nothing if socket not found', () => {
                service.removeConnectedUser('non-existent-socket');
                expect((service as any).userSockets.size).toBe(0);
            });
        });

        describe('getConnectedUsers', () => {
            it('should return empty array when no users', () => {
                expect(service.getConnectedUsers()).toEqual([]);
            });

            it('should return connected users with data', async () => {
                const userData = { firstName: 'John', lastName: 'Doe', username: 'johndoe' };
                redisService.getValue.mockResolvedValue(JSON.stringify(userData));
                await service.addConnectedUser(userId, socketId1);

                const result = service.getConnectedUsers();
                expect(result).toEqual([{ id: userId, ...userData }]);
            });
        });

        describe('Connection Scenarios', () => {
            it('should handle multiple connections/disconnections', async () => {
                const userData = { firstName: 'John', lastName: 'Doe', username: 'johndoe' };
                redisService.getValue.mockResolvedValue(JSON.stringify(userData));

                await service.addConnectedUser(userId, socketId1);
                expect(service.getConnectedUsers().length).toBe(1);

                await service.addConnectedUser(userId, socketId2);
                expect(service.getConnectedUsers().length).toBe(1);

                service.removeConnectedUser(socketId1);
                expect(service.getConnectedUsers().length).toBe(1);

                // Seconde déconnexion
                service.removeConnectedUser(socketId2);
                expect(service.getConnectedUsers().length).toBe(0);
            });

            it('should maintain separate users', async () => {
                const userData1 = { firstName: 'John', lastName: 'Doe', username: 'johndoe' };
                const userData2 = { firstName: 'Jane', lastName: 'Smith', username: 'janesmith' };
                redisService.getValue
                    .mockResolvedValueOnce(JSON.stringify(userData1))
                    .mockResolvedValueOnce(JSON.stringify(userData2));

                await service.addConnectedUser(userId, socketId1);
                await service.addConnectedUser('user-2', socketId2);

                expect(service.getConnectedUsers().length).toBe(2);
            });
        });
    });


});
