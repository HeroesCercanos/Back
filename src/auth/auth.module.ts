import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { GoogleStrategy } from "./strategies/google.strategy";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserModule } from "src/user/user.module";
import { JwtModule } from "@nestjs/jwt";

@Module({
    imports: [
        PassportModule,
        UserModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || "tuSecretoMuySeguro",
            signOptions: { expiresIn: "1h" },
        }),
    ],
    providers: [AuthService, GoogleStrategy],
    controllers: [AuthController],
})
export class AuthModule {}
