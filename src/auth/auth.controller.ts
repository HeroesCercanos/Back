import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    Res,
    UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { LoginUserDto } from "./dto/login-user.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { Request, Response } from "express";

@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) {}
    @Get("google")
    @UseGuards(AuthGuard("google"))
    async googleAuth() {
        // Redirige a Google
    }

    @Get("google/callback")
    @UseGuards(AuthGuard("google"))
    async googleCallback(
        @Req() req: Request & { user: any },
        @Res() res: Response,
    ) {
        const user = req.user as any;
        const { access_token } = await this.authService.validateGoogleLogin({
            googleId: user.googleId,
            email: user.email,
            name: user.name,
            picture: user.picture,
        });

        res.redirect(`http://localhost:3001?token=${access_token}`);
        return { access_token, user };
    }

    @Post("signin")
    async signIn(@Body() dto: LoginUserDto) {
        return this.authService.signIn(dto.email, dto.password);
    }

    @Post("signup")
    async signUp(@Body() dto: CreateUserDto) {
        return this.authService.signUp(dto);
    }

    @Post("google/revoke")
    async revokeGoogle(@Body("token") token: string) {
        return this.authService.revokeGoogleToken(token);
    }
}
