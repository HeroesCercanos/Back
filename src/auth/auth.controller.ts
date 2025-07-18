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
import { GoogleAuthGuard } from "./guards/google-auth/google-auth.guard";

@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) {}
    @Get("google")
    @UseGuards(GoogleAuthGuard)
    async googleAuth() {
        // Redirige a Google
    }

    @Get("google/callback")
    @UseGuards(GoogleAuthGuard)
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

        res.redirect(`${process.env.FRONTEND_URL}?token=${access_token}`);
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

    @Get("me")
    @UseGuards(AuthGuard("jwt")) // o tu guard personalizado
    getProfile(@Req() req) {
        return {
            id: req.user.id,
            email: req.user.email,
            name: req.user.name,
            role: req.user.role
            // cualquier campo que quieras devolver
        };
    }
}
