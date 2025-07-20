import { IsIn, IsOptional, IsString } from "class-validator";

export class UploadMediaDto {
    @IsIn(["image", "video", "raw"])
    resourceType!: "image" | "video" | "raw";

    @IsOptional()
    @IsString()
    caption?: string;
}