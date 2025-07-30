// src/user/dto/change-password.dto.ts
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(8)
  newPassword: string;

  // Si quieres validar confirmPassword aquí, podrías usar un decorador @Match('newPassword')
  // o simplemente omitirlo y confiar en que el front ya lo validó.
  @IsString()
  @MinLength(8)
  confirmPassword: string;
}
