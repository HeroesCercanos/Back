import { IsString, IsEmail, IsNotEmpty, IsNumber } from "class-validator";

export class DonationEmailDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNumber()
    @IsNotEmpty()
    amount: number;
}
