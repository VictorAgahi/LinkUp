import { ExtractJwt, Strategy, StrategyOptionsWithoutRequest, StrategyOptionsWithRequest } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { JWT_CONSTANTS } from './jwt.constants';

interface JwtPayload {
    sub: string;
    email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        const options: StrategyOptionsWithoutRequest = {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: JWT_CONSTANTS.ACCESS_SECRET as string
        };

        super(options);
    }

    async validate(payload: JwtPayload) {
        return {
            userId: payload.sub,
            email: payload.email
        };
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