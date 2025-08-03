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
import { MailModule } from "src/mail/mail.module";
import { MailService } from "src/mail/mail.service";
import { BansModule } from "src/bans/ban.module";
import { Donation } from "src/donations/entity/donation.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Donation]),
        PassportModule,
        UserModule,
        MailModule,
        BansModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || "tuSecretoMuySeguro",
            signOptions: { expiresIn: "1h" },
        }),
    ],
    providers: [AuthService, GoogleStrategy, JwtStrategy, UserService, MailService],
    controllers: [AuthController],

})
export class AuthModule {}
