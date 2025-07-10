import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsString,
    Matches,
    MinLength,
    Validate,
} from "class-validator";
import { Role } from "../../user/role.enum";
import { Match } from "src/common/match.decorator";

export class CreateUserDto {
    @IsNotEmpty()
    name: string;
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,15}$/,
        {
            message:
                "La contraseña debe tener entre 8 y 15 caracteres, incluir al menos una letra minúscula, una mayúscula, un número y un carácter especial (!@#$%^&*).",
        },
    )
    password: string;

    @IsString()
    @MinLength(6)
    @Validate(Match, ["password"], {
        message: "La contraseña y su confirmación no coinciden",
    })
    confirmPassword: string;

    /* @IsEnum(Role, { message: 'Role inválido' })
  role: Role; */
}
