import { ExtractJwt, Strategy, StrategyOptionsWithoutRequest, StrategyOptionsWithRequest } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import {AuthService} from "../auth/auth.service";
import * as process from "node:process";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(private authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_REFRESH_SECRET_KEY || '',
        });
    }

    async validate(payload: any) {
        const { sub: userId, username } = payload;

        const user = await this.authService.findById(userId);
        if (!user) {
            throw new UnauthorizedException('Invalid refresh token');
        }
        return { userId, username };
    }
}
@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
    constructor(private authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET_KEY || '',
        });
    }

    async validate(payload: any) {
        const { sub: userId, username } = payload;

        const user = await this.authService.findById(userId);
        if (!user) {
            throw new UnauthorizedException('User not found or invalid');
        }
        return { userId, username };
    }
}