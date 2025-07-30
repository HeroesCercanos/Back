// src/user/dto/update-role.dto.ts
import { IsEnum } from 'class-validator';
import { Role } from 'src/user/role.enum'; 

export class UpdateRoleDto {
  @IsEnum(Role, { message: 'Rol inválido' })
  role: Role;
}
