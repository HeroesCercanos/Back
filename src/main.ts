import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { loggerGlobal } from "./middlewares/logger.middleware";
import { ValidationPipe } from "@nestjs/common";
import { seedAdmin } from "./seeds/admin.seed";
import { seedQuarter } from "./seeds/quarter.seed";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe());

    app.use(loggerGlobal);
    const config = new DocumentBuilder()
        .setTitle("Heroes Cercanos API")
        .setVersion("1.0")
        .addBearerAuth()
        .build();
    const doc = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("docs", app, doc);
    

    if (process.env.NODE_ENV !== "production") {
        await seedAdmin(); // inserta el admin si no existe
        await seedQuarter();
    }

    app.enableCors({
        origin: ["http://localhost:3001","https://heroes-cercanos-front.onrender.com"],
        credentials: true,
    });
    const port = process.env.PORT || 3000;
    await app.listen(port);
}
bootstrap();
