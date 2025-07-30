import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScheduleModule } from "@nestjs/schedule";
import { EmailTemplate } from "./entities/email-template.entity";
import { ScheduledEmail } from "./entities/scheduled-email.entity";
import { TemplateService } from "./services/template.service";
import { EmailService } from "./services/email.service";
import { SchedulerService } from "./services/scheduler.service";
import { EmailTemplateController } from "./controllers/email-template.controller";
import { ScheduledEmailController } from "./controllers/scheduled-email.controller";

@Module({
    imports: [
        ScheduleModule,
        TypeOrmModule.forFeature([EmailTemplate, ScheduledEmail]),
    ],
    providers: [TemplateService, EmailService, SchedulerService],
    controllers: [EmailTemplateController, ScheduledEmailController],
})
export class EmailModule {}
