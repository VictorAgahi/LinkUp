import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common';
import {JWT_CONSTANTS} from "./jwt.constants";
import {UserService} from "../user/user.service";
import {JwtService} from "@nestjs/jwt";
import {Socket} from "socket.io";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(private userService: UserService) {
        super({
            jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
            ignoreExpiration: false,
            secretOrKey: JWT_CONSTANTS.ACCESS_SECRET || '',
        });
    }

    async validate(payload: any) {
        const { sub: userId } = payload;

        const user = await this.userService.findById(userId);
        if (!user) {
            throw new UnauthorizedException('Invalid refresh token');
        }
        return { userId };
    }
}
@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
    constructor(private userService: UserService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: JWT_CONSTANTS.ACCESS_SECRET || '',
        });
    }

    async validate(payload: any) {
        const { sub: userId } = payload;

        const user = await this.userService.findById(userId);
        if (!user) {
            throw new UnauthorizedException('User not found or invalid');
        }
        return { userId };
    }
}


export interface CustomSocket extends Socket {
    user?: any;
}

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    canActivate(context: ExecutionContext): boolean {
        const client = context.switchToWs().getClient<CustomSocket>();
        const authHeader = client.handshake.headers.authorization || client.handshake.auth?.token;

        if (!authHeader) {
            throw new UnauthorizedException('Missing access token');
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            throw new UnauthorizedException('Invalid access token format');
        }

        const token = parts[1];
        try {
            const secret = JWT_CONSTANTS.ACCESS_SECRET;
            if (!secret) {
                throw new UnauthorizedException('Missing JWT secret');
            }
            const payload = this.jwtService.verify(token, { secret, algorithms: ['HS256'] });
            client.user = payload;
            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired access token');
        }
    }
}