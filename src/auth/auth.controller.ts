import {
    Body,
    Controller,
    Get,
    HttpCode,
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

    //cookies
    @Get("google/callback")
    @UseGuards(GoogleAuthGuard)
    async googleCallback(
        @Req() req: Request & { user: any },
        @Res() res: Response,
    ) {
        // limpio la cookie de sesiones anteriores
        res.clearCookie("jwtToken", { path: "/" });

        const { access_token } = await this.authService.validateGoogleLogin({
            googleId: req.user.googleId,
            email: req.user.email,
            name: req.user.name,
            picture: req.user.picture,
        });

        res.cookie("jwtToken", access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/",
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.redirect(process.env.FRONTEND_URL!);
    }

    /* @Get("google/callback")
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
    }*/

    //cookies
    @Post("signin")
    @HttpCode(200)
    async signIn(
        @Body() dto: LoginUserDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        // 1) limpio la cookie antigua siempre
        res.clearCookie("jwtToken", { path: "/" });

        // 2) intento login con credenciales
        const { access_token } = await this.authService.signIn(
            dto.email,
            dto.password,
        );

        // 3) si pasó, seteo la cookie nueva
        res.cookie("jwtToken", access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/",
            maxAge: 24 * 60 * 60 * 1000,
        });

        return { message: "Login exitoso" };
    }

    /* @Post("signin")
    async signIn(@Body() dto: LoginUserDto) {
        return this.authService.signIn(dto.email, dto.password);
    } */

    //cookies
    /*  @Post("signup")
    @HttpCode(201)
    async signUp(
        @Body() dto: CreateUserDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        
        // idem: limpio antes de crear usuario
        res.clearCookie("jwtToken", { path: "/" });
        const { access_token } = await this.authService.signUp(dto);

        res.cookie("jwtToken", access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/",
            maxAge: 24 * 60 * 60 * 1000,
        });

        return { message: "Registro exitoso y sesión iniciada" };
    }
 */
    /* @Post("signup")
    async signUp(@Body() dto: CreateUserDto) {
        return this.authService.signUp(dto);
    }  */

    @Post("signup")
    @HttpCode(201)
    async signUp(@Body() dto: CreateUserDto) {
        return this.authService.signUp(dto);
    }

    @Get("me")
    @UseGuards(AuthGuard("jwt"))
    getProfile(@Req() req) {
        return {
            user: {
                id: req.user.id,
                email: req.user.email,
                name: req.user.name,
                role: req.user.role,
                // si tienes donations u otros campos:
            },
        };
    }

    @Post("logout")
    @HttpCode(200)
    logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie("jwtToken", {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            // domain: '.tu-dominio.com' si usas subdominios
        });
        return { message: "Logout exitoso" };
    }
}
