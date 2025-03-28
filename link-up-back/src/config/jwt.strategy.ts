import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import {AuthService} from "../auth/auth.service";
import {JWT_CONSTANTS} from "./jwt.constants";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(private authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
            ignoreExpiration: false,
            secretOrKey: JWT_CONSTANTS.ACCESS_SECRET || '',
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
            secretOrKey: JWT_CONSTANTS.ACCESS_SECRET || '',
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