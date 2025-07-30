// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt, JwtFromRequestFunction } from "passport-jwt";
import { Request } from "express";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "src/user/entity/user.entity";

// 1) Defino un extractor que lee req.cookies.jwtToken
const cookieExtractor: JwtFromRequestFunction = (req: Request) => {
    return req?.cookies?.jwtToken || null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                cookieExtractor, // ← primero miro la cookie
                ExtractJwt.fromAuthHeaderAsBearerToken(), // ← luego el Authorization header
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
        });
    }

    async validate(payload: any): Promise<User> {
        const user = await this.userRepository.findOneBy({ id: payload.sub });
        if (!user) {
            throw new UnauthorizedException("Usuario no encontrado");
        }
        if (!user.isActive) {
            throw new UnauthorizedException("Cuenta desactivada");
        }
        return user;
    }
}

// src/auth/strategies/jwt.strategy.ts
/* import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { Strategy, ExtractJwt } from "passport-jwt";
import { User } from "src/user/entity/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
        });
    }

    async validate(payload: any): Promise<User> {
        const user = await this.userRepository.findOneBy({ id: payload.sub });

        if (!user) {
            throw new UnauthorizedException("Usuario no encontrado");
        }

        return user;
    }
} */
