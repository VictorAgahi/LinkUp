import {Body, Controller, Get, UseGuards} from "@nestjs/common";
import UserService from "./user.service";
import {AccessTokenDto} from "./dto/accessToken.dto";
import {AuthGuard} from "@nestjs/passport";



@Controller('user')
export class UserController
{
    constructor(private userService: UserService){}

    @Get('info')
    @UseGuards(AuthGuard('jwt-access'))
    async login(dto: AccessTokenDto) {
        return this.userService.me(dto);
    }

}