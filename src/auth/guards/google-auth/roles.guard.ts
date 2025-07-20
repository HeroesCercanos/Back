// src/auth/roles.guard.ts
import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "src/auth/decorator/roles.decorator"; 
import { Role } from "src/user/role.enum"; 

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(ctx: ExecutionContext): boolean {
        // 1) Obtengo los roles requeridos en el handler o en el controller
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
            ROLES_KEY,
            [ctx.getHandler(), ctx.getClass()],
        );
        if (!requiredRoles) return true; // no se requiere rol especial

        // 2) Extraigo el usuario del request (con AuthGuard('jwt') ya validado)
        const request = ctx.switchToHttp().getRequest();
        const user = request.user as { roles?: Role[] };

        // 3) Compruebo que tenga al menos uno de los roles requeridos
        const hasRole = user.roles?.some((r) => requiredRoles.includes(r));
        if (!hasRole) throw new ForbiddenException("No tienes permiso");
        return true;
    }
}
