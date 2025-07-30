import { Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import { Repository } from "typeorm";
import { EmailTemplate } from "../entities/email-template.entity";
import { ScheduledEmail } from "../entities/scheduled-email.entity";
import { CreateScheduledEmailDto, UpdateScheduledEmailDto } from "../dto";
import { EmailService } from "./email.service";
import { TemplateService } from "./template.service";

@Injectable()
export class SchedulerService implements OnModuleInit {
    constructor(
        @InjectRepository(ScheduledEmail)
        private readonly repo: Repository<ScheduledEmail>,
        private readonly schedulerRegistry: SchedulerRegistry,
        private readonly tplService: TemplateService,
        private readonly emailService: EmailService,
    ) {}

    async onModuleInit() {
        const jobs = await this.repo.find({ where: { enabled: true } });
        for (const job of jobs) this.addCronJob(job);
    }

    private getCronExpr(job: ScheduledEmail): string {
        if (job.frequency === "daily") return "0 8 * * *";
        if (job.frequency === "weekly") return "0 9 * * 1";
        if (job.frequency === "monthly") return "0 9 1 * *";
        if (!job.cronExpression) {
            throw new Error(`No cronExpression definido para job ${job.id}`);
        }
        return job.cronExpression;
    }

    private addCronJob(job: ScheduledEmail) {
        const name = job.id;
        const cronExpr = this.getCronExpr(job);
        const task = new CronJob(cronExpr, async () => {
            const tpl = await this.tplService.findOne(job.template.id);
            const recipients = await this.fetchAllUserEmails();
            await this.emailService.sendTemplate(tpl, recipients);
        });
        this.schedulerRegistry.addCronJob(name, task);
        task.start();
    }

    private removeCronJob(id: string) {
        this.schedulerRegistry.deleteCronJob(id);
    }

    async createAndSchedule(dto: CreateScheduledEmailDto) {
        const template = await this.tplService.findOne(dto.templateId);
        const job = this.repo.create({ ...dto, template });
        const saved = await this.repo.save(job);
        if (saved.enabled) this.addCronJob(saved);
        return saved;
    }

    async findAll() {
        return this.repo.find({ relations: ["template"] });
    }

    async findOne(id: string) {
        const job = await this.repo.findOne({
            where: { id },
            relations: ["template"],
        });
        if (!job) throw new NotFoundException();
        return job;
    }

    async updateAndReschedule(id: string, dto: UpdateScheduledEmailDto) {
        const job = await this.repo.preload({ id, ...dto });
        if (!job) throw new NotFoundException();
        const saved = await this.repo.save(job);
        this.removeCronJob(saved.id);
        if (saved.enabled) this.addCronJob(saved);
        return saved;
    }

    async removeAndUnschedule(id: string) {
        await this.repo.delete(id);
        this.removeCronJob(id);
        return { deleted: true };
    }

    private async fetchAllUserEmails(): Promise<string[]> {
        // TODO: inyectar tu UserService y hacer:
        // const users = await this.userService.findAll();
        // return users.map(u => u.email);
        return ["test1@example.com", "test2@example.com"];
    }
}