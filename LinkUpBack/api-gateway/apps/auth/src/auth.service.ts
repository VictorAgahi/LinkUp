import { Injectable } from '@nestjs/common';
import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  LogoutResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ValidateTokenRequest,
  ValidateTokenResponse,
  RevokeTokenRequest,
  RevokeTokenResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  CheckPermissionsRequest,
  CheckPermissionsResponse,
  ListSessionsRequest,
  ListSessionsResponse,
  ToggleMFARequest,
  ToggleMFAResponse,
  DatabaseServiceClient,
  DATABASE_SERVICE_NAME,
  AddUserToCacheRequest,
  CreateUserResponse,
  CacheServiceClient,
  CACHE_SERVICE_NAME,
} from '@app/common';
import { lastValueFrom } from 'rxjs';

import { Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { CACHE_SERVICE, DATABASE_SERVICE } from './utils/constants';
import { OnModuleInit } from '@nestjs/common';


@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private databaseService: DatabaseServiceClient;
  private cacheService: CacheServiceClient;

  constructor(
    @Inject(DATABASE_SERVICE) private databaseClient: ClientGrpc,
    @Inject(CACHE_SERVICE) private cacheClient: ClientGrpc, 
  ) {}

  onModuleInit() {
    this.cacheService = this.cacheClient.getService<CacheServiceClient>(CACHE_SERVICE_NAME);
    this.databaseService = this.databaseClient.getService<DatabaseServiceClient>(DATABASE_SERVICE_NAME);
  }

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    
    try {
      this.logger.log('Calling AuthService: register');
      const userIdResponse: CreateUserResponse = await lastValueFrom(this.databaseService.createUser(request)); 
      this.logger.log(`User ID: ${userIdResponse.userId}`);
      const userDataString = JSON.stringify(request);  
      await lastValueFrom(this.cacheService.addUserToCache({ userId: userIdResponse.userId, userData: userDataString }));
      this.logger.log(`User added to cache: ${userIdResponse.userId}`);
      this.logger.log(`User data: ${userDataString}`);  
      return { 
        accessToken: 'dummy-access-token', 
        refreshToken: 'dummy-refresh-token', 
        expiresAt: Date.now() + 3600 
      };
    } catch (error) {
      throw new Error('User registration failed');
    }
    }

  async login(request: LoginRequest): Promise<LoginResponse> {
    return { accessToken: 'dummy-access-token', refreshToken: 'dummy-refresh-token', expiresAt: Date.now() + 3600 };
  }

  async logout(request: LogoutRequest): Promise<LogoutResponse> {
    return { message: 'Logout successful' };
  }

  async refreshAccessToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    return { accessToken: 'new-dummy-access-token', expiresAt: Date.now() + 3600 };
  }

  async validateAccessToken(request: ValidateTokenRequest): Promise<ValidateTokenResponse> {
    return { isValid: true, userId: 'dummy-user-id', roles: ['user'] };
  }

  async revokeRefreshToken(request: RevokeTokenRequest): Promise<RevokeTokenResponse> {
    return { message: 'Refresh token revoked' };
  }

  async changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    return { message: 'Password changed successfully' };
  }

  async resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    return { message: 'Password reset successful' };
  }

  async checkPermissions(request: CheckPermissionsRequest): Promise<CheckPermissionsResponse> {
    return { grantedPermissions: ['read', 'write'] };
  }

  async listActiveSessions(request: ListSessionsRequest): Promise<ListSessionsResponse> {
    return {
      sessions: [
        { sessionId: 'session-1', device: 'PC', ipAddress: '192.168.1.1', lastActive: Date.now() },
        { sessionId: 'session-2', device: 'Mobile', ipAddress: '192.168.1.2', lastActive: Date.now() - 5000 },
      ],
    };
  }

  async toggleMfa(request: ToggleMFARequest): Promise<ToggleMFAResponse> {
    return { message: request.enable ? 'MFA enabled' : 'MFA disabled' };
  }
}