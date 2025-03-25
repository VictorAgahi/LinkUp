import {Controller, Post, Get, Param, Body, HttpException, HttpStatus} from '@nestjs/common';
import { UserService } from './user.service';
import {UserEntity} from "./user.entity";

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('create')
    async createUser(
        @Body() userData: { firstName: string; lastName: string; username: string; email: string; password: string }
    ): Promise<{ message: string; user: UserEntity }> {
        try {
            const user = await this.userService.createUser(
                userData.firstName,
                userData.lastName,
                userData.username,
                userData.email,
                userData.password,
            );
            await this.userService.cacheUser(user);
            return { message: 'User created successfully', user };
        } catch (error) {
            throw new HttpException('Error creating user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get(':id')
    async getUser(@Param('id') id: string) {
        const user = await this.userService.getUser(id);
        if (!user) {
            return { message: 'User not found' };
        }
        return user;
    }
}