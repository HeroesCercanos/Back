import { Injectable } from "@nestjs/common";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { ConfigService } from "@nestjs/config";
import { join } from "path";
import { UploadMediaDto } from "./dto/cloudinary.dto"; 

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
        return cloudinary.uploader.upload(filePath, {
            resource_type: dto.resourceType,
            folder: "trainings",
            use_filename: true,
            unique_filename: false,
        });
    }

    async listMediaFromFolder(folder: string) {
        const result = await cloudinary.search
            .expression(`folder:${folder}`)
            .sort_by("public_id", "desc")
            .max_results(100)
            .execute();
        return result.resources;
    }

    async getMediaByPublicId(publicId: string) {
        const result = await cloudinary.search
            .expression(`public_id:${publicId}`)
            .max_results(1)
            .execute();
        return result.resources?.[0] || null;
    }
}