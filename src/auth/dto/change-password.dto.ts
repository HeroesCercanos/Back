// src/auth/dto/change-password.dto.ts

import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString({ message: 'La nueva contraseña debe ser un texto' })
  @MinLength(6, {
    message: 'La nueva contraseña debe tener al menos $constraint1 caracteres',
  })
  newPassword: string;

  @IsString({ message: 'La confirmación de contraseña debe ser un texto' })
  @MinLength(6, {
    message: 'La confirmación de contraseña debe tener al menos $constraint1 caracteres',
  })
  confirmPassword: string;
}
