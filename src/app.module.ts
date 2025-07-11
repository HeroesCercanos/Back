import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import typeOrmConfig from "./config/typeorm";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QuarterModule } from './quarter/quarter.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

import { MatchConstraint } from "./common/match.decorator";
import { IncidentController } from './incidents/incidents.controller';
import { IncidentService } from './incidents/incidents.service';
import { IncidentModule } from './incidents/incidents.module';



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

        QuarterModule,

        UserModule,
        
        AuthModule,

        IncidentModule,
    ],
    controllers: [AppController],
    providers: [AppService, MatchConstraint],
})
export class AppModule {}

