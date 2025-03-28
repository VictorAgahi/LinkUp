import { Body, Controller, Get, Patch, Delete, Req, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { RequestAccessTokenDto } from "./dto/request.accessToken.dto";
import { AuthGuard } from "@nestjs/passport";

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Get('info')
    @UseGuards(AuthGuard('jwt-access'))
    async info(@Req() req: any): Promise<any> {
        const dto = new RequestAccessTokenDto(req.user.userId, req.user.username);
        console.log(dto.userId, dto.username);
        return this.userService.info(dto);
    }

    @Patch('update')
    @UseGuards(AuthGuard('jwt-access'))
    async updateUser(@Req() req, @Body() updateData: any): Promise<any> {
        const dto = new RequestAccessTokenDto(req.user.userId, req.user.username);
        return this.userService.updateUser(dto, updateData)
    }

    @Delete('delete')
    @UseGuards(AuthGuard('jwt-access'))
    async deleteUser(@Req() req: any): Promise<any>  {
        const dto = new RequestAccessTokenDto(req.user.userId, req.user.username);
        return this.userService.deleteUser(dto)
    }
}