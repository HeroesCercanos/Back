import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    Body,
    Get,
    Param,
    Delete,
    BadRequestException,
    UseGuards,
    Res,
    Patch,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { unlink } from "fs/promises";

import { CloudinaryService } from "./cloudinary.service";
import { UploadMediaDto } from "./dto/cloudinary.dto";
import { multerConfig } from "./multer.config";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { RolesGuard } from "./roles.guard";
import { Roles } from "./roles.decorator";
import { UpdateMediaDto } from "./dto/update-media.dto";
import { Role } from "src/user/role.enum";

@Controller("cloudinary")
export class CloudinaryController {
    constructor(private readonly cloudinary: CloudinaryService) {}

    @Post("upload")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @UseInterceptors(FileInterceptor("file", multerConfig))
    async upload(
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: UploadMediaDto,
    ) {
        if (!file) throw new BadRequestException("No file provided");

        try {
            const upload = await this.cloudinary.uploadMedia(file.path, dto);

            return {
                public_id: upload.public_id,
                secure_url: upload.secure_url,
                resource_type: upload.resource_type,
                format: upload.format,
                duration: upload.duration,
                context: upload.context,
            };
        } catch (error) {
            console.error("Error uploading to Cloudinary:", error);
            throw new BadRequestException("Upload failed");
        } finally {
            await unlink(file.path).catch(() =>
                console.warn("Failed to delete temp file"),
            );
        }
    }

    @Get("trainings")
    async getAllTrainings() {
        try {
            const media =
                await this.cloudinary.listMediaFromFolder("trainings");

            return media
                .filter((file) =>
                    ["image", "video", "raw"].includes(file.resource_type),
                )
                .map((file) => ({
                    public_id: file.public_id,
                    secure_url: file.secure_url,
                    resource_type: file.resource_type,
                    format: file.format,
                    duration: file.duration,
                    context: file.context,
                }));
        } catch (error) {
            console.error("Error listing trainings:", error);
            throw new BadRequestException("Failed to list trainings");
        }
    }

    @Get("trainings/:publicId")
    async getTrainingById(
        @Param("publicId") publicId: string,
        @Res() res: Response,
    ) {
        const fullId = `trainings/${publicId}`;

        try {
            const media = await this.cloudinary.getMediaByPublicId(fullId);

            if (!media) {
                return res.status(404).json({ message: "Media not found" });
            }

            return res.json({
                public_id: media.public_id,
                secure_url: media.secure_url,
                resource_type: media.resource_type,
                format: media.format,
                duration: media.duration,
                context: media.context,
            });
        } catch (error) {
            console.error("Error getting media by ID:", error);
            return res.status(500).json({ message: "Failed to fetch media" });
        }
    }

    @Delete("trainings/:publicId")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async deleteTraining(@Param("publicId") publicId: string) {
        const fullId = `trainings/${publicId}`;

        try {
            await this.cloudinary.deleteMedia(fullId);
            return { success: true };
        } catch (error) {
            console.error("Error deleting training:", error);
            throw new BadRequestException("Failed to delete media");
        }
    }

    @Patch("trainings/:publicId")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("admin")
    async updateTraining(
        @Param("publicId") publicId: string,
        @Body() dto: UpdateMediaDto,
    ) {
        const fullId = `trainings/${publicId}`;

        try {
            await this.cloudinary.updateMediaContext(fullId, dto);
            return { success: true };
        } catch (error) {
            console.error("Error updating training:", error);
            throw new BadRequestException("Failed to update media");
        }
    }
}
