import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EmailTemplate } from "../entities/email-template.entity";
import { CreateEmailTemplateDto, UpdateEmailTemplateDto } from "../dto";

@Injectable()
export class TemplateService {
    constructor(
        @InjectRepository(EmailTemplate)
        private readonly repo: Repository<EmailTemplate>,
    ) {}

    create(dto: CreateEmailTemplateDto) {
        return this.repo.save(this.repo.create(dto));
    }

    findAll() {
        return this.repo.find();
    }

    async findOne(id: string) {
        const tpl = await this.repo.findOneBy({ id });
        if (!tpl) throw new NotFoundException("Template not found");
        return tpl;
    }

    update(id: string, dto: UpdateEmailTemplateDto) {
        return this.repo.save({ id, ...dto });
    }

    async remove(id: string) {
        await this.repo.delete(id);
        return { deleted: true };
    }
}
