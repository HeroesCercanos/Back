import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Patch,
    Delete,
} from "@nestjs/common";
import { TemplateService } from "../services/template.service";
import { CreateEmailTemplateDto, UpdateEmailTemplateDto } from "../dto";

@Controller("email-templates")
export class EmailTemplateController {
    constructor(private readonly tpl: TemplateService) {}

    @Post() create(@Body() dto: CreateEmailTemplateDto) {
        return this.tpl.create(dto);
    }

    @Get() findAll() {
        return this.tpl.findAll();
    }
    @Get(":id") findOne(@Param("id") id: string) {
        return this.tpl.findOne(id);
    }

    @Patch(":id") update(
        @Param("id") id: string,
        @Body() dto: UpdateEmailTemplateDto,
    ) {
        return this.tpl.update(id, dto);
    }

    @Delete(":id") remove(@Param("id") id: string) {
        return this.tpl.remove(id);
    }
}
