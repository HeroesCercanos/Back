import { IsString, IsEmail, IsNotEmpty } from "class-validator";

export class RegistrationEmailDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;
}
