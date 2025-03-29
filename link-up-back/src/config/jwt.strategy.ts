import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import {JWT_CONSTANTS} from "./jwt.constants";
import {UserService} from "../user/user.service";

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