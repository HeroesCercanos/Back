import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const config = new DocumentBuilder()
        .setTitle("Heroes Cercanos API")
        .setVersion("1.0")
        .addBearerAuth()
        .build();
    const doc = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("docs", app, doc);

    const port = process.env.PORT || 3000;
    await app.listen(port);
}
bootstrap();
