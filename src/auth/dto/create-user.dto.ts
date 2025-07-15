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
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
    @ApiProperty({ example: "John Doe" })
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: "user@gmailcom" })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: "123456" })
    @IsNotEmpty()
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,15}$/,
        {
            message:
                "La contraseña debe tener entre 8 y 15 caracteres, incluir al menos una letra minúscula, una mayúscula, un número y un carácter especial (!@#$%^&*).",
        },
    )
    password: string;

    @ApiProperty({ example: "123456" })
    @IsString()
    @MinLength(6)
    @Validate(Match, ["password"], {
        message: "La contraseña y su confirmación no coinciden",
    })
    confirmPassword: string;

    /* @IsEnum(Role, { message: 'Role inválido' })
  role: Role; */
}
