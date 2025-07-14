import { IsIn } from "class-validator";

export class UploadMediaDto {
    @IsIn(["image", "video", "raw"])
    resourceType!: "image" | "video" | "raw";
}