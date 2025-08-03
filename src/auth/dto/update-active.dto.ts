// src/user/dto/update-active.dto.ts
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class UpdateActiveDto {
    @IsBoolean()
    isActive: boolean;

    @IsOptional()
    @IsString()
    reason?: string; // motivo de baneo manual
}
