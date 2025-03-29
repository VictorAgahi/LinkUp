import { forwardRef, Global, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtAccessStrategy, JwtRefreshStrategy } from '../../config/jwt.strategy';
import { WebSocketGateway } from './websocket.gateway';
import { UserModule } from "../../user/user.module";
import {UserService} from "../../user/user.service";
import {AuthService} from "../../auth/auth.service";

@Global()
@Module({
    imports: [
        forwardRef(() => UserModule),
        PassportModule.register({ defaultStrategy: 'jwt-access' }),
    ],
    providers: [
        JwtAccessStrategy,
        UserService,
        JwtRefreshStrategy,
        AuthService,
        WebSocketGateway,
    ],
    exports: [WebSocketGateway, JwtAccessStrategy, JwtRefreshStrategy],
})
export class WebSocketModule {}