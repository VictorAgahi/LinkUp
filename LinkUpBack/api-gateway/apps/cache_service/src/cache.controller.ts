import { Controller } from '@nestjs/common';
import { CacheService } from './cache.service';
import {
  CacheServiceController,
  CacheServiceControllerMethods,
  CheckUserInCacheRequest,
  CheckUserInCacheResponse,
  AddUserToCacheRequest,
  AddUserToCacheResponse,
  UpdateUserInCacheRequest,
  UpdateUserInCacheResponse,
  RemoveUserFromCacheRequest,
  RemoveUserFromCacheResponse,
  CheckTokenInCacheRequest,
  CheckTokenInCacheResponse,
  RemoveTokenFromCacheRequest,
  RemoveTokenFromCacheResponse,
  CheckMessagesInCacheRequest,
  CheckMessagesInCacheResponse,
  AddMessagesToCacheRequest,
  AddMessagesToCacheResponse,
  RemoveMessagesFromCacheRequest,
  RemoveMessagesFromCacheResponse,
  CheckNotificationsInCacheRequest,
  CheckNotificationsInCacheResponse,
  AddNotificationsToCacheRequest,
  AddNotificationsToCacheResponse,
  RemoveNotificationsFromCacheRequest,
  RemoveNotificationsFromCacheResponse,
  CheckUserRelationInCacheRequest,
  CheckUserRelationInCacheResponse,
  AddUserRelationToCacheRequest,
  AddUserRelationToCacheResponse,
  RemoveUserRelationFromCacheRequest,
  RemoveUserRelationFromCacheResponse
} from '@app/common';

@Controller()
@CacheServiceControllerMethods()
export class CacheController implements CacheServiceController {
  constructor(private readonly cacheService: CacheService) {}

  // User Cache Methods
  async checkUserInCache(
    request: CheckUserInCacheRequest
  ): Promise<CheckUserInCacheResponse> {
    return this.cacheService.checkUserInCache(request);
  }

  async addUserToCache(
    request: AddUserToCacheRequest
  ): Promise<AddUserToCacheResponse> {
    return this.cacheService.addUserToCache(request);
  }

  async updateUserInCache(
    request: UpdateUserInCacheRequest
  ): Promise<UpdateUserInCacheResponse> {
    return this.cacheService.updateUserInCache(request);
  }

  async removeUserFromCache(
    request: RemoveUserFromCacheRequest
  ): Promise<RemoveUserFromCacheResponse> {
    return this.cacheService.removeUserFromCache(request);
  }

  // Token Cache Methods
  async checkTokenInCache(
    request: CheckTokenInCacheRequest
  ): Promise<CheckTokenInCacheResponse> {
    return this.cacheService.checkTokenInCache(request);
  }

  async removeTokenFromCache(
    request: RemoveTokenFromCacheRequest
  ): Promise<RemoveTokenFromCacheResponse> {
    return this.cacheService.removeTokenFromCache(request);
  }

  // Messages Cache Methods
  async checkMessagesInCache(
    request: CheckMessagesInCacheRequest
  ): Promise<CheckMessagesInCacheResponse> {
    return this.cacheService.checkMessagesInCache(request);
  }

  async addMessagesToCache(
    request: AddMessagesToCacheRequest
  ): Promise<AddMessagesToCacheResponse> {
    return this.cacheService.addMessagesToCache(request);
  }

  async removeMessagesFromCache(
    request: RemoveMessagesFromCacheRequest
  ): Promise<RemoveMessagesFromCacheResponse> {
    return this.cacheService.removeMessagesFromCache(request);
  }

  async checkNotificationsInCache(
    request: CheckNotificationsInCacheRequest
  ): Promise<CheckNotificationsInCacheResponse> {
    return this.cacheService.checkNotificationsInCache(request);
  }

  async addNotificationsToCache(
    request: AddNotificationsToCacheRequest
  ): Promise<AddNotificationsToCacheResponse> {
    return this.cacheService.addNotificationsToCache(request);
  }

  async removeNotificationsFromCache(
    request: RemoveNotificationsFromCacheRequest
  ): Promise<RemoveNotificationsFromCacheResponse> {
    return this.cacheService.removeNotificationsFromCache(request);
  }

  async checkUserRelationInCache(
    request: CheckUserRelationInCacheRequest
  ): Promise<CheckUserRelationInCacheResponse> {
    return this.cacheService.checkUserRelationInCache(request);
  }

  async addUserRelationToCache(
    request: AddUserRelationToCacheRequest
  ): Promise<AddUserRelationToCacheResponse> {
    return this.cacheService.addUserRelationToCache(request);
  }

  async removeUserRelationFromCache(
    request: RemoveUserRelationFromCacheRequest
  ): Promise<RemoveUserRelationFromCacheResponse> {
    return this.cacheService.removeUserRelationFromCache(request);
  }
}