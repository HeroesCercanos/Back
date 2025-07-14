import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { diskStorage } from "multer";
import { extname } from "path";

export const multerConfig: MulterOptions = {
    storage: diskStorage({
        destination: "./uploads",
        filename: (_, file, cb) => {
            const safeName =
                file.originalname
                    .replace(/\s+/g, "_")
                    .replace(extname(file.originalname), "") +
                extname(file.originalname);
            cb(null, `${Date.now()}_${safeName}`);

        },
    }),
    limits: { fileSize: 20 * 1024 * 1024 },
};

