import { Injectable } from "@nestjs/common";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { ConfigService } from "@nestjs/config";
import { UploadMediaDto } from "./dto/cloudinary.dto";
import { CloudinaryResource } from "./cloudinary.types";
import { UpdateMediaDto } from "./dto/update-media.dto";

@Injectable()
export class CloudinaryService {
    constructor(private config: ConfigService) {
        cloudinary.config({
            cloud_name: this.config.get("CLOUDINARY_CLOUD_NAME"),
            api_key: this.config.get("CLOUDINARY_API_KEY"),
            api_secret: this.config.get("CLOUDINARY_API_SECRET"),
        });
    }

    uploadMedia(
        filePath: string,
        dto: UploadMediaDto,
    ): Promise<UploadApiResponse> {
        const contextParts: string[] = [];
        if (dto.title) contextParts.push(`title=${dto.title}`);
        if (dto.caption) contextParts.push(`caption=${dto.caption}`);

        return cloudinary.uploader.upload(filePath, {
            resource_type: dto.resourceType,
            folder: "trainings",
            use_filename: true,
            unique_filename: false,
            context: contextParts.length ? contextParts.join("|") : undefined,
        });
    }

    async listMediaFromFolder(folder: string): Promise<CloudinaryResource[]> {
        try {
            const resourceTypes = ["image", "video", "raw"];
            const allMedia: CloudinaryResource[] = [];

            for (const type of resourceTypes) {
                const result = await cloudinary.api.resources({
                    resource_type: type,
                    type: "upload",
                    prefix: `${folder}/`,
                    context: true,
                    max_results: 100,
                });

                allMedia.push(...(result.resources as CloudinaryResource[]));
            }

            return allMedia;
        } catch (error) {
            console.error("Cloudinary error:", error);
            throw error;
        }
    }

    async getMediaByPublicId(
        publicId: string,
    ): Promise<CloudinaryResource | null> {
        try {
            const result = await cloudinary.search
                .expression(`public_id:${publicId}`)
                .max_results(1)
                .execute();

            return (result.resources?.[0] as CloudinaryResource) ?? null;
        } catch (error) {
            console.error("Error getting media by ID:", error);
            throw error;
        }
    }

    async deleteMedia(publicId: string) {
        try {
            const media = await this.getMediaByPublicId(publicId);
            if (!media) {
                throw new Error("Media not found");
            }

            const resourceType = media.resource_type;

            return await cloudinary.uploader.destroy(publicId, {
                resource_type: resourceType,
            });
        } catch (error) {
            console.error("Error deleting media:", error);
            throw error;
        }
    }

    async updateMediaContext(publicId: string, dto: UpdateMediaDto) {
        const parts: string[] = [];
        if (dto.title) parts.push(`title=${dto.title}`);
        if (dto.caption) parts.push(`caption=${dto.caption}`);
        if (parts.length === 0) throw new Error("No context to update");

        const media = await this.getMediaByPublicId(publicId);
        if (!media) throw new Error("Media not found");

        const contextString = parts.join("|");

        return cloudinary.uploader.add_context(
            contextString,
            [publicId],
            { resource_type: media.resource_type }
        );
    }
}
