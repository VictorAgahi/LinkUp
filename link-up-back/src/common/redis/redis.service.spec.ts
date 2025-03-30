import { RedisService } from './redis.service';
import Redis from 'ioredis';
import { Logger } from '@nestjs/common';


const redisClientMock = {
    on: jest.fn(),
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue('storedValue'),
    del: jest.fn().mockResolvedValue(1),
    quit: jest.fn().mockResolvedValue('OK'),
};

jest.mock('ioredis', () => ({
    default: jest.fn(() => redisClientMock)
}));


describe('RedisService', () => {
    let service: RedisService;

    beforeEach(() => {
        service = new RedisService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('onModuleInit', () => {
        it('should instantiate Redis client and register event listeners', async () => {
            const loggerLogSpy = jest.spyOn((service as any).logger, 'log').mockImplementation(() => {});
            const loggerErrorSpy = jest.spyOn((service as any).logger, 'error').mockImplementation(() => {});

            await service.onModuleInit();

            expect(redisClientMock.on).toHaveBeenCalledWith('connect', expect.any(Function));
            expect(redisClientMock.on).toHaveBeenCalledWith('error', expect.any(Function));

            const connectCallback = redisClientMock.on.mock.calls.find(call => call[0] === 'connect')[1];
            connectCallback();
            expect(loggerLogSpy).toHaveBeenCalledWith('✅ Connected to Redis');

            const errorCallback = redisClientMock.on.mock.calls.find(call => call[0] === 'error')[1];
            const error = new Error('Redis error');
            errorCallback(error);
            expect(loggerErrorSpy).toHaveBeenCalledWith(
                `❌ Redis connection error: `,
                error
            );
        });
    });

    describe('setValue', () => {
        beforeEach(async () => {
            await service.onModuleInit();
        });

        it('should set a value with a TTL', async () => {
            await service.setValue('testKey', 'testValue', 60);
            expect(redisClientMock.set).toHaveBeenCalledWith('testKey', 'testValue', 'EX', 60);
        });
    });

    describe('getValue', () => {
        beforeEach(async () => {
            await service.onModuleInit();
        });

        it('should retrieve a value from Redis', async () => {
            const result = await service.getValue('testKey');
            expect(redisClientMock.get).toHaveBeenCalledWith('testKey');
            expect(result).toBe('storedValue');
        });
    });

    describe('deleteKey', () => {
        beforeEach(async () => {
            await service.onModuleInit();
        });

        it('should delete a key and return the number of keys deleted', async () => {
            const result = await service.deleteKey('testKey');
            expect(redisClientMock.del).toHaveBeenCalledWith('testKey');
            expect(result).toBe(1);
        });
    });

    describe('client getter', () => {
        beforeEach(async () => {
            await service.onModuleInit();
        });

        it('should return the Redis client instance', () => {
            expect(service.client).toBe(redisClientMock);
        });
    });

    describe('onModuleDestroy', () => {
        beforeEach(async () => {
            await service.onModuleInit();
        });

        it('should quit the Redis client and log disconnection', async () => {
            const loggerLogSpy = jest.spyOn((service as any).logger, 'log').mockImplementation(() => {});
            await service.onModuleDestroy();
            expect(redisClientMock.quit).toHaveBeenCalled();
            expect(loggerLogSpy).toHaveBeenCalledWith('🛑 Disconnected from Redis');
        });
    });
});