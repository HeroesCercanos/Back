// src/auth/strategies/jwt.strategy.ts
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET 
        });
    }

    async validate(payload: any) {
        // payload.sub = user.id, payload.role = Role.*
        return {
            userId: payload.sub,
            name: payload.name,
            email: payload.email,
            role: payload.role,
        };
    }
}
