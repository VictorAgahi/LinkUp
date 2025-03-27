import { Module } from '@nestjs/common';
import UserService from "./user.service";
import {UserController} from "./user.controller";
import {PassportModule} from "@nestjs/passport";
import {JwtAccessStrategy} from "../config/jwt.strategy";


@Module({
    imports: [PassportModule.register({ defaultStrategy: 'jwt-access' })],
    controllers: [UserController],
    providers: [UserService],
    exports: [PassportModule, JwtAccessStrategy],
})
export class UserModule {}