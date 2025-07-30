import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Patch,
    Delete,
} from "@nestjs/common";
import { SchedulerService } from "../services/scheduler.service";
import { CreateScheduledEmailDto, UpdateScheduledEmailDto } from "../dto";

@Controller("scheduled-emails")
export class ScheduledEmailController {
    constructor(private readonly sched: SchedulerService) {}

    @Post() create(@Body() dto: CreateScheduledEmailDto) {
        return this.sched.createAndSchedule(dto);
    }

    @Get() findAll() {
        return this.sched.findAll();
    }
    @Get(":id") findOne(@Param("id") id: string) {
        return this.sched.findOne(id);
    }

    @Patch(":id") update(
        @Param("id") id: string,
        @Body() dto: UpdateScheduledEmailDto,
    ) {
        return this.sched.updateAndReschedule(id, dto);
    }

    @Delete(":id") remove(@Param("id") id: string) {
        return this.sched.removeAndUnschedule(id);
    }
}
