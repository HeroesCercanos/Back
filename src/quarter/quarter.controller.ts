import { Controller, Get } from "@nestjs/common";
import { QuarterService } from "./quarter.service";
import { Quarter } from "./entities/quarter.entity";

@Controller("quarter")
export class QuarterController {
    constructor(private readonly quarterService: QuarterService) {}
    @Get()
    async findOne(id): Promise<Quarter> {
        return this.quarterService.findOne(id);
    }

    async findAll(): Promise<Quarter[]> {
        return this.quarterService.findAll();
    }
}
