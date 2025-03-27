import { ExtractJwt, Strategy, StrategyOptionsWithoutRequest, StrategyOptionsWithRequest } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { JWT_CONSTANTS } from './jwt.constants';
import {AuthService} from "../auth/auth.service";
import * as process from "node:process";

interface JwtPayload {
    sub: string;
    email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET_KEY || "",
        });
    }

    async validate(payload: any) {
        const { sub: userId, username } = payload;

        const user = await this.authService.findById(userId);
        if (!user) {
            throw new Error('User not found or invalid');
        }
        return { userId, username };
    }
}


@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'refresh-jwt') {
    constructor() {
        super({
            jwtFromRequest: (req: Request) => req.body?.refreshToken,
            secretOrKey: process.env.JWT_REFRESH_SECRET,
            passReqToCallback: true
        } as StrategyOptionsWithRequest);
    }

    async validate(req: Request, payload: JwtPayload) {
        if (!req.body?.refreshToken) {
            throw new UnauthorizedException('Refresh token manquant');
        }
        return {
            userId: payload.sub,
            refreshToken: req.body.refreshToken
        };
    }
}