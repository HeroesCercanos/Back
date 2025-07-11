// auth/dto/login-user.dto.ts
import { IsEmail, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;
}
