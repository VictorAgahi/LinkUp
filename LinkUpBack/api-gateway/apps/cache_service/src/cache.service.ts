import { Injectable, Logger } from '@nestjs/common';
import { CacheServiceControllerMethods, CheckUserInCacheRequest, CheckUserInCacheResponse, AddUserToCacheRequest, AddUserToCacheResponse, UpdateUserInCacheRequest, UpdateUserInCacheResponse, RemoveUserFromCacheRequest, RemoveUserFromCacheResponse, CheckTokenInCacheRequest, CheckTokenInCacheResponse, RemoveTokenFromCacheRequest, RemoveTokenFromCacheResponse, CheckMessagesInCacheRequest, CheckMessagesInCacheResponse, AddMessagesToCacheRequest, AddMessagesToCacheResponse, RemoveMessagesFromCacheRequest, RemoveMessagesFromCacheResponse, CheckNotificationsInCacheRequest, CheckNotificationsInCacheResponse, AddNotificationsToCacheRequest, AddNotificationsToCacheResponse, RemoveNotificationsFromCacheRequest, RemoveNotificationsFromCacheResponse, CheckUserRelationInCacheRequest, CheckUserRelationInCacheResponse, AddUserRelationToCacheRequest, AddUserRelationToCacheResponse, RemoveUserRelationFromCacheRequest, RemoveUserRelationFromCacheResponse } from '@app/common';
import { Redis } from 'ioredis';

@Injectable()
@CacheServiceControllerMethods()
export class CacheService {
  private redisClient: Redis;
  private readonly logger = new Logger(CacheService.name); 

  constructor() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || 'redis',
      port: Number(process.env.REDIS_PORT || 6379),
      password: process.env.REDIS_PASSWORD,
      db: Number(process.env.REDIS_DB || 0),
    });

    this.redisClient.on('connect', () => {
      this.logger.log('✅ Connected to Redis');
    });

    this.redisClient.on('error', (err) => {
      this.logger.error(`❌ Redis connection error: `, err);
    });
  }

  async checkUserInCache(
    request: CheckUserInCacheRequest
  ): Promise<CheckUserInCacheResponse> {
    this.logger.log(`Checking if user exists in cache: ${request.userId}`);

    const cacheKey = `user:${request.userId}`;
    const userInCache = await this.redisClient.get(cacheKey);

    if (userInCache) {
      this.logger.log(`User found in cache: ${request.userId}`);
      return { exists: true };
    } 
    else {
      this.logger.log(`User not found in cache: ${request.userId}`);
      return { exists: false };
    }
  }

  async addUserToCache(
    request: AddUserToCacheRequest
  ): Promise<AddUserToCacheResponse> {
    this.logger.log(`Adding user to cache: ${request.userId}`);

    const cacheKey = `user:${request.userId}`;
    await this.redisClient.set(cacheKey, request.userData, 'EX', 3600); 

    return { success: true };
  }

  async updateUserInCache(
    request: UpdateUserInCacheRequest
  ): Promise<UpdateUserInCacheResponse> {
    this.logger.log(`Updating user in cache: ${request.userId}`);

    const cacheKey = `user:${request.userId}`;
    await this.redisClient.set(cacheKey, request.updatedData, 'EX', 3600); // TTL 1 heure

    return { success: true };
  }

  async removeUserFromCache(
    request: RemoveUserFromCacheRequest
  ): Promise<RemoveUserFromCacheResponse> {
    this.logger.log(`Removing user from cache: ${request.userId}`);

    const cacheKey = `user:${request.userId}`;
    const deletedCount = await this.redisClient.del(cacheKey);

    return { success: deletedCount > 0 };
  }

  async checkTokenInCache(
    request: CheckTokenInCacheRequest
  ): Promise<CheckTokenInCacheResponse> {
    this.logger.log(`Checking if token exists in cache: ${request.token}`);

    const cacheKey = `token:${request.token}`;
    const tokenInCache = await this.redisClient.get(cacheKey);

    return { exists: tokenInCache ? true : false };
  }

  async removeTokenFromCache(
    request: RemoveTokenFromCacheRequest
  ): Promise<RemoveTokenFromCacheResponse> {
    this.logger.log(`Removing token from cache: ${request.token}`);

    const cacheKey = `token:${request.token}`;
    const deletedCount = await this.redisClient.del(cacheKey);

    return { success: deletedCount > 0 };
  }

  async checkMessagesInCache(
    request: CheckMessagesInCacheRequest
  ): Promise<CheckMessagesInCacheResponse> {
    this.logger.log(`Checking if messages exist in cache: ${request.conversationId}`);

    const cacheKey = `messages:${request.conversationId}`;
    const messagesInCache = await this.redisClient.get(cacheKey);

    return { exists: messagesInCache ? true : false, messages: messagesInCache ? JSON.parse(messagesInCache) : [] };
  }

  async addMessagesToCache(
    request: AddMessagesToCacheRequest
  ): Promise<AddMessagesToCacheResponse> {
    this.logger.log(`Adding messages to cache: ${request.conversationId}`);

    const cacheKey = `messages:${request.conversationId}`;
    await this.redisClient.set(cacheKey, JSON.stringify(request.messages), 'EX', 3600); // TTL 1 heure

    return { success: true };
  }

  async removeMessagesFromCache(
    request: RemoveMessagesFromCacheRequest
  ): Promise<RemoveMessagesFromCacheResponse> {
    this.logger.log(`Removing messages from cache: ${request.conversationId}`);

    const cacheKey = `messages:${request.conversationId}`;
    const deletedCount = await this.redisClient.del(cacheKey);

    return { success: deletedCount > 0 };
  }

  async checkNotificationsInCache(
    request: CheckNotificationsInCacheRequest
  ): Promise<CheckNotificationsInCacheResponse> {
    this.logger.log(`Checking if notifications exist in cache for user: ${request.userId}`);

    const cacheKey = `notifications:${request.userId}`;
    const notificationsInCache = await this.redisClient.get(cacheKey);

    return { exists: notificationsInCache ? true : false, notifications: notificationsInCache ? JSON.parse(notificationsInCache) : [] };
  }

  async addNotificationsToCache(
    request: AddNotificationsToCacheRequest
  ): Promise<AddNotificationsToCacheResponse> {
    this.logger.log(`Adding notifications to cache for user: ${request.userId}`);

    const cacheKey = `notifications:${request.userId}`;
    await this.redisClient.set(cacheKey, JSON.stringify(request.notifications), 'EX', 3600); // TTL 1 heure

    return { success: true };
  }

  async removeNotificationsFromCache(
    request: RemoveNotificationsFromCacheRequest
  ): Promise<RemoveNotificationsFromCacheResponse> {
    this.logger.log(`Removing notifications from cache for user: ${request.userId}`);

    const cacheKey = `notifications:${request.userId}`;
    const deletedCount = await this.redisClient.del(cacheKey);

    return { success: deletedCount > 0 };
  }

  async checkUserRelationInCache(
    request: CheckUserRelationInCacheRequest
  ): Promise<CheckUserRelationInCacheResponse> {
    this.logger.log(`Checking user relation in cache: ${request.userId1} and ${request.userId2}`);

    const cacheKey = `relation:${request.userId1}:${request.userId2}`;
    const relationInCache = await this.redisClient.get(cacheKey);

    return { exists: relationInCache ? true : false };
  }

  async addUserRelationToCache(
    request: AddUserRelationToCacheRequest
  ): Promise<AddUserRelationToCacheResponse> {
    this.logger.log(`Adding user relation to cache: ${request.userId1} and ${request.userId2}`);

    const cacheKey = `relation:${request.userId1}:${request.userId2}`;
    await this.redisClient.set(cacheKey, 'true', 'EX', 3600); // TTL 1 heure

    return { success: true };
  }

  async removeUserRelationFromCache(
    request: RemoveUserRelationFromCacheRequest
  ): Promise<RemoveUserRelationFromCacheResponse> {
    this.logger.log(`Removing user relation from cache: ${request.userId1} and ${request.userId2}`);

    const cacheKey = `relation:${request.userId1}:${request.userId2}`;
    const deletedCount = await this.redisClient.del(cacheKey);

    return { success: deletedCount > 0 };
  }
}