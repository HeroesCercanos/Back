import { IsEmail, IsString, IsNotEmpty, MinLength } from "class-validator";

export class ResetPasswordEmailDto {
    @IsEmail()
    email: string;

    @IsString()
    token: string;
}
