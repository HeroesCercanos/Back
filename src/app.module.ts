import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import typeOrmConfig from "./config/typeorm";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QuartersModule } from './quarters/quarters.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [typeOrmConfig],
        }),

        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => {
                const dbConfig = config.get("typeorm");

                if (!dbConfig) {
                    throw new Error(
                        "No se encontró la configuración de TypeORM.",
                    );
                }

                return dbConfig;
            },
        }),
        
        QuartersModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
