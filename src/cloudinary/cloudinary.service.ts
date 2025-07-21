import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { ConfigService } from "@nestjs/config";
import { UploadMediaDto } from "./dto/cloudinary.dto";
import { createReadStream } from "fs";
interface UploadOptions {
    publicId: string;
    folder?: string;
    context?: string;
}

interface CloudinaryResource {
    public_id: string;
    secure_url: string;
    resource_type: string;
    format: string;
    duration?: number;
    context?: {
        custom?: Record<string, string>;
    };
}
@Injectable()
export class CloudinaryService {
    constructor(private config: ConfigService) {
        cloudinary.config({
            cloud_name: this.config.get("CLOUDINARY_CLOUD_NAME"),
            api_key: this.config.get("CLOUDINARY_API_KEY"),
            api_secret: this.config.get("CLOUDINARY_API_SECRET"),
        });
    }

    async uploadMedia(
        filePath: string,
        { publicId, folder, context }: UploadOptions,
    ): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const fullPublicId = folder ? `${folder}/${publicId}` : publicId;
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    public_id: fullPublicId,
                    overwrite: true,
                    unique_filename: false,
                    context: context ? `caption=${context}` : undefined,
                },
                (err, result) => (err ? reject(err) : resolve(result!)),
            );
            createReadStream(filePath).pipe(uploadStream);
        });
    }

    async getMediaByPublicId(
        publicId: string,
    ): Promise<CloudinaryResource | null> {
        try {
            const result = await cloudinary.api.resource(publicId, {
                resource_type: "auto",
            });
            return result;
        } catch {
            return null;
        }
    }

    async deleteMedia(publicId: string) {
        // Obtener el recurso para determinar el tipo
        const resource = await this.getMediaByPublicId(publicId);
        if (!resource) throw new Error("Media not found");

        return cloudinary.uploader.destroy(publicId, {
            resource_type: resource.resource_type,
        });
    }

    async listMediaFromFolder(folder: string): Promise<CloudinaryResource[]> {
        try {
            const result = await cloudinary.api.resources({
                type: "upload",
                prefix: `${folder}/`, // busca dentro de esta carpeta
                max_results: 100, // ajusta según tu necesidad
            });
            return result.resources;
        } catch (err: any) {
            throw new InternalServerErrorException(
                `Error listando medios de Cloudinary: ${err.message}`,
            );
        }
    }
}
