import { PartialType } from "@nestjs/mapped-types";
import { CreateScheduledEmailDto } from "./create-scheduled-email.dto";

export class UpdateScheduledEmailDto extends PartialType(
    CreateScheduledEmailDto,
) {}
