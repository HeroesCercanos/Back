import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { GoogleStrategy } from "./strategies/google.strategy";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserModule } from "src/user/user.module";
import { JwtModule } from "@nestjs/jwt";
import { UserService } from "src/user/user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/user/entity/user.entity";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        PassportModule,
        UserModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || "tuSecretoMuySeguro",
            signOptions: { expiresIn: "1h" },
        }),
    ],
    providers: [AuthService, GoogleStrategy, JwtStrategy, UserService],
    controllers: [AuthController],

})
export class AuthModule {}
