import {
    IsArray,
    IsDateString,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
} from "class-validator";

export class CreateCampaignDto {
    @IsString()
    @IsNotEmpty()
    subject: string;

    @IsOptional()
    @IsArray()
    @IsEmail({}, { each: true })
    recipients: string[];

    @IsOptional()
    @IsDateString()
    scheduledAt?: string;

    @IsString()
    @IsNotEmpty()
    titulo: string;

    @IsString()
    @IsNotEmpty()
    parrafo1: string;

    @IsString()
    @IsNotEmpty()
    parrafo2: string;

    @IsString()
    @IsNotEmpty()
    cierre: string;
}
