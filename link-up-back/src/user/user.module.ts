import { Module } from '@nestjs/common';
import {UserService} from "./user.service";
import {UserController} from "./user.controller";
import {PassportModule} from "@nestjs/passport";
import {JwtAccessStrategy} from "../config/jwt.strategy";
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt-access' }),
        AuthModule
    ],
    controllers: [UserController],
    providers: [UserService, JwtAccessStrategy],
    exports: [PassportModule, JwtAccessStrategy],
})
export class UserModule {}