import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { 
  RegisterRequest, RegisterResponse,
  LoginRequest, LoginResponse,
  LogoutRequest, LogoutResponse,
  RefreshTokenRequest, RefreshTokenResponse,
  ValidateTokenRequest, ValidateTokenResponse,
  RevokeTokenRequest, RevokeTokenResponse,
  ChangePasswordRequest, ChangePasswordResponse,
  ResetPasswordRequest, ResetPasswordResponse,
  CheckPermissionsRequest, CheckPermissionsResponse,
  ListSessionsRequest, ListSessionsResponse,
  ToggleMFARequest, ToggleMFAResponse,
  AuthServiceClient,
  AUTH_SERVICE_NAME
} from '@app/common';
import { AUTH_SERVICE } from '../utils/constants';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private authService: AuthServiceClient;

  constructor(@Inject(AUTH_SERVICE) private client: ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  async register(request: RegisterRequest) {
    this.logger.log('Calling AuthService: register');
    return await this.authService.register(request);
  }

  async login(request: LoginRequest) {
    this.logger.log('Calling AuthService: login');
    return await this.authService.login(request);
  }

  async logout(request: LogoutRequest){
    this.logger.log('Calling AuthService: logout');
    return await this.authService.logout(request);
  }

  async refreshAccessToken(request: RefreshTokenRequest) {
    this.logger.log('Calling AuthService: refreshAccessToken');
    return await this.authService.refreshAccessToken(request);
  }

  async validateAccessToken(request: ValidateTokenRequest){
    this.logger.log('Calling AuthService: validateAccessToken');
    return await this.authService.validateAccessToken(request);
  }

  async revokeRefreshToken(request: RevokeTokenRequest) {
    this.logger.log('Calling AuthService: revokeRefreshToken');
    return await this.authService.revokeRefreshToken(request);
  }

  async changePassword(request: ChangePasswordRequest){
    this.logger.log('Calling AuthService: changePassword');
    return await this.authService.changePassword(request);
  }

  async resetPassword(request: ResetPasswordRequest){
    this.logger.log('Calling AuthService: resetPassword');
    return await this.authService.resetPassword(request);
  }

  async checkPermissions(request: CheckPermissionsRequest) {
    this.logger.log('Calling AuthService: checkPermissions');
    return await this.authService.checkPermissions(request);
  }

  async listActiveSessions(request: ListSessionsRequest) {
    this.logger.log('Calling AuthService: listActiveSessions');
    return await this.authService.listActiveSessions(request);
  }

  async toggleMfa(request: ToggleMFARequest)
  {
    this.logger.log('Calling AuthService: toggleMfa');
    return await this.authService.toggleMfa(request);
  }
}