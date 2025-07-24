import { IsEmail, IsString, IsNotEmpty } from "class-validator";

export class ResetPasswordEmailDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    token: string;
}
