import { Controller, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthServiceController, AuthServiceControllerMethods } from '@app/common';
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
} from '@app/common';

@Controller()
@AuthServiceControllerMethods()
export class AuthController implements AuthServiceController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    this.logger.log('Register method called');
    return this.authService.register(request);
  }

  async login(request: LoginRequest): Promise<LoginResponse> {
    this.logger.log('Login method called');
    return this.authService.login(request);
  }

  async logout(request: LogoutRequest): Promise<LogoutResponse> {
    this.logger.log('Logout method called');
    return this.authService.logout(request);
  }

  async refreshAccessToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    this.logger.log('RefreshAccessToken method called');
    return this.authService.refreshAccessToken(request);
  }

  async validateAccessToken(request: ValidateTokenRequest): Promise<ValidateTokenResponse> {
    this.logger.log('ValidateAccessToken method called');
    return this.authService.validateAccessToken(request);
  }

  async revokeRefreshToken(request: RevokeTokenRequest): Promise<RevokeTokenResponse> {
    this.logger.log('RevokeRefreshToken method called');
    return this.authService.revokeRefreshToken(request);
  }

  async changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    this.logger.log('ChangePassword method called');
    return this.authService.changePassword(request);
  }

  async resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    this.logger.log('ResetPassword method called');
    return this.authService.resetPassword(request);
  }

  async checkPermissions(request: CheckPermissionsRequest): Promise<CheckPermissionsResponse> {
    this.logger.log('CheckPermissions method called');
    return this.authService.checkPermissions(request);
  }

  async listActiveSessions(request: ListSessionsRequest): Promise<ListSessionsResponse> {
    this.logger.log('ListActiveSessions method called');
    return this.authService.listActiveSessions(request);
  }

  async toggleMfa(request: ToggleMFARequest): Promise<ToggleMFAResponse> {
    this.logger.log('ToggleMFA method called');
    return this.authService.toggleMfa(request);
  }
}