import {
    IsUUID,
    IsEnum,
    IsOptional,
    IsString,
    IsBoolean,
} from "class-validator";
import { Frequency } from "../entities/scheduled-email.entity";

export class CreateScheduledEmailDto {
    @IsUUID() templateId: string;
    @IsEnum(["daily", "weekly", "monthly", "custom"]) frequency: Frequency;
    @IsString() @IsOptional() cronExpression?: string;
    @IsBoolean() @IsOptional() enabled?: boolean;
}
