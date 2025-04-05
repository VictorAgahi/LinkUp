import { 
    Controller, Post, Body, Get, Patch, Req 
  } from '@nestjs/common';
  import { AuthService } from './auth.service';
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
    ToggleMFARequest, ToggleMFAResponse
  } from '@app/common';
  
  @Controller('auth')
  export class AuthController {
    constructor(private readonly authService: AuthService) {}
  
    @Post('register')
    async register(@Body() request: RegisterRequest) {
      console.log('Register endpoint called');
      return this.authService.register(request);
    }
  
    @Post('login')
    async login(@Body() request: LoginRequest) {
      console.log('Login endpoint called');
      return this.authService.login(request);
    }
  
    @Post('logout')
    async logout(@Body() request: LogoutRequest) {
      console.log('Logout endpoint called');
      return this.authService.logout(request);
    }
  
    @Post('refresh-token')
    async refreshToken(@Body() request: RefreshTokenRequest) {
      console.log('Refresh Token endpoint called');
      return this.authService.refreshAccessToken(request);
    }
  
    @Post('validate-token')
    async validateToken(@Body() request: ValidateTokenRequest) {
      console.log('Validate Token endpoint called');
      return this.authService.validateAccessToken(request);
    }
  
    @Post('revoke-token')
    async revokeToken(@Body() request: RevokeTokenRequest) {
      console.log('Revoke Token endpoint called');
      return this.authService.revokeRefreshToken(request);
    }
  
    @Patch('change-password')
    async changePassword(@Body() request: ChangePasswordRequest){
      console.log('Change Password endpoint called');
      return this.authService.changePassword(request);
    }
  
    @Post('reset-password')
    async resetPassword(@Body() request: ResetPasswordRequest) {
      console.log('Reset Password endpoint called');
      return this.authService.resetPassword(request);
    }
  
    @Post('check-permissions')
    async checkPermissions(@Body() request: CheckPermissionsRequest){
      console.log('Check Permissions endpoint called');
      return this.authService.checkPermissions(request);
    }
  
    @Get('sessions')
    async listSessions(@Req() request: ListSessionsRequest) 
    {
      console.log('List Sessions endpoint called');
      return this.authService.listActiveSessions(request);
    }
  
    @Patch('toggle-mfa')
    async toggleMfa(@Body() request: ToggleMFARequest)
     {
      console.log('Toggle MFA endpoint called');
      return this.authService.toggleMfa(request);
    }
  }