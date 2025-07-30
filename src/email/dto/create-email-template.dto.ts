import { IsString, IsNotEmpty } from "class-validator";

export class CreateEmailTemplateDto {
    @IsString() @IsNotEmpty() name: string;
    @IsString() @IsNotEmpty() subject: string;
    @IsString() @IsNotEmpty() htmlContent: string;
}
