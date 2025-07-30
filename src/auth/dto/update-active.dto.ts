// src/user/dto/update-active.dto.ts
import { IsBoolean } from 'class-validator';

export class UpdateActiveDto {
  @IsBoolean()
  isActive: boolean;
}
