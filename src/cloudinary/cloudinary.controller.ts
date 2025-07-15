import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    Body,
    Get,
    Param,
    Res,
    BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { CloudinaryService } from "./cloudinary.service";
import { UploadMediaDto } from "./dto/cloudinary.dto";
import { multerConfig } from "./multer.config";
import { unlink } from "fs/promises";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { RolesGuard } from "./roles.guard";
import { Roles } from "./roles.decorator";
import { UseGuards } from "@nestjs/common";
@Controller("cloudinary")
export class CloudinaryController {
    constructor(private readonly cloudinary: CloudinaryService) {}

    @Post("upload")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("admin")
    @UseInterceptors(FileInterceptor("file", multerConfig))
    async upload(
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: UploadMediaDto,
    ) {
        if (!file) throw new BadRequestException("No file provided");
        const upload = await this.cloudinary.uploadMedia(file.path, dto);
        await unlink(file.path);
        return {
            public_id: upload.public_id,
            secure_url: upload.secure_url,
            resource_type: upload.resource_type,
            format: upload.format,
            duration: upload.duration,
        };
    }

    @Get("trainings")
    async getAllTrainings() {
        const folder = "trainings";
        const media = await this.cloudinary.listMediaFromFolder(folder);
        return media
            .filter(
                (file) =>
                    ["image", "video", "raw"].includes(file.resource_type) &&
                    (file.format === "pdf" || file.resource_type !== "raw"),
            )
            .map((file) => ({
                public_id: file.public_id,
                secure_url: file.secure_url,
                resource_type: file.resource_type,
                format: file.format,
                duration: file.duration,
            }));
    }

    @Get("trainings/:publicId")
    async getTrainingById(
        @Param("publicId") publicId: string,
        @Res() res: Response,
    ) {
        const fullId = `trainings/${publicId}`;
        const media = await this.cloudinary.getMediaByPublicId(fullId);
        if (!media) return res.status(404).json({ message: "Media not found" });
        return res.json({
            public_id: media.public_id,
            secure_url: media.secure_url,
            resource_type: media.resource_type,
            format: media.format,
            duration: media.duration,
        });
    }
}
