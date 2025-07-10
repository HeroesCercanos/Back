import { IsEmail, IsEnum, IsNotEmpty, Matches } from 'class-validator';
import { Role } from '../../user/role.enum';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,15}$/,
    {
      message:
        'La contraseña debe tener entre 8 y 15 caracteres, incluir al menos una letra minúscula, una mayúscula, un número y un carácter especial (!@#$%^&*).',
    },
  )
  password: string;

  @IsNotEmpty()
  name: string;

  /* @IsEnum(Role, { message: 'Role inválido' })
  role: Role; */
}
