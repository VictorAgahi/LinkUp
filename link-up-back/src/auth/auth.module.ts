import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtRefreshStrategy } from "../config/jwt.strategy";
import { PassportModule } from "@nestjs/passport";
import { UserModule } from "../user/user.module";
import {UserService} from "../user/user.service";

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt-refresh' }),
        forwardRef(() => UserModule),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtRefreshStrategy, UserService],
    exports: [PassportModule, JwtRefreshStrategy, AuthService],
})
export class AuthModule {}