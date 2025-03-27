import { Module } from '@nestjs/common';
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import {JwtRefreshStrategy} from "../config/jwt.strategy";
import {PassportModule} from "@nestjs/passport";

@Module({

    imports: [PassportModule.register({ defaultStrategy: 'jwt-refresh' })],
    controllers: [AuthController],
    providers: [AuthService,JwtRefreshStrategy],
    exports: [PassportModule, JwtRefreshStrategy],
})
export class AuthModule {}