import { IsString, IsEmail, IsNotEmpty } from "class-validator";

export class IncidentEmailDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    type: string;

    @IsString()
    @IsNotEmpty()
    location: string;
}
