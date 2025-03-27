import {
    Controller, Post, Body, UseGuards,
} from '@nestjs/common';
import {LoginDto} from "./dto/login.dto";
import {RegisterDto} from "./dto/register.dto";
import {AuthService} from "./auth.service";
import {RefreshTokenDto} from "./dto/refresh-token.dto";
import {AuthGuard} from "@nestjs/passport";





@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}


    @Post('register')
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }
    @Post('login')
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }
    @Post('refresh-token')
    @UseGuards(AuthGuard('jwt-refresh'))
    async refreshToken(@Body() dto: RefreshTokenDto) {
        return this.authService.refreshToken(dto);
    }


}