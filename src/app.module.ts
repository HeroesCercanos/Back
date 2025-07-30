import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import typeOrmConfig from "./config/typeorm";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QuarterModule } from "./quarter/quarter.module";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";

import { MatchConstraint } from "./common/match.decorator";
import { IncidentModule } from "./incidents/incidents.module";
import { CloudinaryController } from "./cloudinary/cloudinary.controller";
import { CloudinaryModule } from "./cloudinary/cloudinary.module";
import { CloudinaryService } from "./cloudinary/cloudinary.service";
import { MailService } from "./mail/mail.service";
import { MailModule } from "./mail/mail.module";
import { DonationModule } from "./donations/donations.module";
import { CampaignModule } from "./campaigns/campaigns.module";
import { WebhookController } from "./webhook/webhook.controller";

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

        CloudinaryModule,

        MailModule,

        DonationModule,

        CampaignModule,

        
    ],
    controllers: [AppController, CloudinaryController, WebhookController],
    providers: [AppService, MatchConstraint, CloudinaryService, MailService],
})
export class AppModule {}

/* import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import typeOrmConfig from "./config/typeorm";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QuarterModule } from "./quarter/quarter.module";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";

import { MatchConstraint } from "./common/match.decorator";
import { IncidentModule } from "./incidents/incidents.module";
import { CloudinaryController } from "./cloudinary/cloudinary.controller";
import { CloudinaryModule } from "./cloudinary/cloudinary.module";
import { CloudinaryService } from "./cloudinary/cloudinary.service";
import { MailService } from "./mail/mail.service";
import { MailModule } from "./mail/mail.module";
import { DonationModule } from "./donations/donations.module";
import { CampaignModule } from "./campaigns/campaigns.module";
import { WebhookController } from "./webhook/webhook.controller";

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

        CloudinaryModule,

        MailModule,

        DonationModule,

        CampaignModule,

        
    ],
    controllers: [AppController, CloudinaryController, WebhookController],
    providers: [AppService, MatchConstraint, CloudinaryService, MailService],
})
export class AppModule {}
 */