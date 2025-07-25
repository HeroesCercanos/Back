// src/donation/dto/create-donation.dto.ts
import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateDonationDto {
    @IsNumber()
    @Min(0.01)
    amount: number;

    @IsString()
    @IsOptional()
    description?: string;
}
