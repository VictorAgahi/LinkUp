import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private redisClient: Redis;
    private readonly logger = new Logger(RedisService.name); // Logger NestJS

    async onModuleInit() {
        this.redisClient = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT) || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
            db: Number(process.env.REDIS_DB) || 0,
        });

        this.redisClient.on('connect', () => {
            this.logger.log('✅ Connected to Redis');
        });

        this.redisClient.on('error', (err) => {
            this.logger.error(`❌ Redis connection error: ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`, err);
        });
    }

    async setValue(key: string, value: string, ttl: number) {
        await this.redisClient.set(key, value, 'EX', ttl);
    }

    async getValue(key: string): Promise<string | null> {
        return this.redisClient.get(key);
    }

    async deleteKey(key: string): Promise<number> {
        return this.redisClient.del(key);
    }

    get client() {
        return this.redisClient;
    }

    async onModuleDestroy() {
        if (this.redisClient) {
            await this.redisClient.quit();
            this.logger.log('🛑 Disconnected from Redis');
        }
    }
}