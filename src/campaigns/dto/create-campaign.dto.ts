// src/campaign/dto/create-campaign.dto.ts
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsDateString,
} from "class-validator";

export class CreateCampaignDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsDateString()
    startDate: string; // ISO date string

    @IsDateString()
    endDate: string;
}
