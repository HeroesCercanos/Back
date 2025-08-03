import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EmailCampaign } from "./entities/campaign.entity";
import { Repository, LessThanOrEqual } from "typeorm";
import { CreateCampaignDto } from "./dto/create-campaign.dto";
import * as nodemailer from "nodemailer";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs";
import * as path from "path";
import { User } from "src/user/entity/user.entity";

@Injectable()
export class EmailCampaignService {
    private transporter;
    private readonly logger = new Logger(EmailCampaignService.name);

    constructor(
        @InjectRepository(EmailCampaign)
        private readonly campaignRepo: Repository<EmailCampaign>,

        @InjectRepository(User)
        private readonly userRepo: Repository<User>,

        private readonly config: ConfigService,
    ) {
        this.transporter = nodemailer.createTransport({
            host: this.config.get("MAIL_HOST"),
            port: this.config.get<number>("MAIL_PORT"),
            secure: false,
            requireTLS: true,
            auth: {
                user: this.config.get("MAIL_USER"),
                pass: this.config.get("MAIL_PASS"),
            },
        });
    }

    private async getAllUserEmails(): Promise<string[]> {
        const users = await this.userRepo.find({ select: ["email"] });
        return users.map((user) => user.email).filter(Boolean);
    }

    async createCampaign(dto: CreateCampaignDto) {
        this.logger.debug("📨 Iniciando creación de campaña", dto);

        const status = dto.scheduledAt ? "scheduled" : "sent";

        const recipients = dto.recipients?.filter(Boolean).map((e) => e.trim())
            ?.length
            ? dto.recipients.map((e) => e.trim()).filter(Boolean)
            : await this.getAllUserEmails();

        this.logger.debug("👥 Destinatarios resueltos:", recipients);

        if (!recipients.length) {
            this.logger.error("❌ No se encontraron destinatarios");
            throw new Error(
                "No se encontraron destinatarios para esta campaña.",
            );
        }

        const variables = {
            titulo: dto.titulo,
            parrafo1: dto.parrafo1,
            parrafo2: dto.parrafo2,
            cierre: dto.cierre,
        };

        const campaign = this.campaignRepo.create({
            subject: dto.subject,
            templateName: "heroes-cercanos",
            recipients: recipients.join(","),
            variables: JSON.stringify(variables),
            status,
            scheduledAt: dto.scheduledAt
                ? new Date(dto.scheduledAt)
                : undefined,
        });

        this.logger.debug("💾 Guardando campaña:", campaign);

        await this.campaignRepo.save(campaign);

        if (status === "sent") {
            this.logger.debug("📤 Enviando campaña inmediatamente");
            await this.sendEmails(campaign);
        }

        return campaign;
    }

    async updateCampaign(id: number, dto: Partial<CreateCampaignDto>) {
        const campaign = await this.campaignRepo.findOneBy({ id });
        if (!campaign) throw new Error(`No existe la campaña con id=${id}`);

        campaign.subject = dto.subject ?? campaign.subject;

        if (dto.recipients) {
            campaign.recipients = dto.recipients
                .map((e) => e.trim())
                .filter(Boolean)
                .join(",");
        }

        campaign.scheduledAt = dto.scheduledAt
            ? new Date(dto.scheduledAt)
            : campaign.scheduledAt;

        if (dto.titulo || dto.parrafo1 || dto.parrafo2 || dto.cierre) {
            const oldVars = JSON.parse(campaign.variables);
            campaign.variables = JSON.stringify({
                ...oldVars,
                ...(dto.titulo && { titulo: dto.titulo }),
                ...(dto.parrafo1 && { parrafo1: dto.parrafo1 }),
                ...(dto.parrafo2 && { parrafo2: dto.parrafo2 }),
                ...(dto.cierre && { cierre: dto.cierre }),
            });
        }

        return this.campaignRepo.save(campaign);
    }

    async deleteCampaign(id: number) {
        const result = await this.campaignRepo.delete({ id });

        if (result.affected === 0) {
            throw new Error(`No se pudo eliminar la campaña con id=${id}`);
        }

        return { message: `Campaña ${id} eliminada correctamente` };
    }

    async sendEmails(campaign: EmailCampaign) {
        const recipients = campaign.recipients
            .split(",")
            .map((e) => e.trim())
            .filter(Boolean);

        const html = await this.renderTemplate(
            campaign.templateName,
            JSON.parse(campaign.variables),
        );

        for (const email of recipients) {
            await this.transporter.sendMail({
                from: `"Héroes Cercanos" <${this.config.get("MAIL_FROM")}>`,
                to: email,
                subject: campaign.subject,
                html,
            });
        }

        this.logger.log(
            `Campaña ${campaign.id} enviada a ${recipients.length} destinatarios`,
        );

        campaign.status = "sent";
        await this.campaignRepo.save(campaign);
    }

    private async renderTemplate(
        templateName: string,
        variables: Record<string, string>,
    ): Promise<string> {
        const filePath = path.join(
            process.cwd(),
            "src",
            "templates",
            `${templateName}.html`,
        );
        let template = await fs.promises.readFile(filePath, "utf-8");

        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
            template = template.replace(regex, value);
        }

        return template;
    }

    async getAll() {
        return this.campaignRepo.find({ order: { createdAt: "DESC" } });
    }

    async getPendingCampaigns() {
        return this.campaignRepo.find({
            where: {
                status: "scheduled",
                scheduledAt: LessThanOrEqual(new Date()),
            },
        });
    }

    async sendEmailsById(id: number) {
        const campaign = await this.campaignRepo.findOneBy({ id });

        if (!campaign) {
            throw new Error(`No existe la campaña con id=${id}`);
        }

        if (campaign.status === "sent") {
            this.logger.warn(`La campaña ${id} ya fue enviada. Reenviando...`);
        }

        await this.sendEmails(campaign);
    }
}
