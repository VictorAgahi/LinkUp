import {
    Controller,
    Post,
    Get,
    Param,
    Body,
    HttpException,
    HttpStatus,
    UseGuards,
    Req,
    UnauthorizedException
} from '@nestjs/common';
import {LoginDto} from "./dto/login.dto";
import {RegisterDto} from "./dto/register.dto";
import {AuthService} from "./auth.service";



@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')
    async register(@Body() dto: RegisterDto) {
        console.log(dto);
        return this.authService.register(dto);
    }
    @Post('login')
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }


}