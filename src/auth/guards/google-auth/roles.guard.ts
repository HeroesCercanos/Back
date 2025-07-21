// src/auth/guards/roles.guard.ts
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
    constructor(private reflector: Reflector) {}

    canActivate(ctx: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
            ROLES_KEY,
            [ctx.getHandler(), ctx.getClass()],
        );
        if (!requiredRoles) return true;

        const request = ctx.switchToHttp().getRequest();
        const user = request.user as { role?: Role };

        // ahora comparamos el campo singular
        if (!user.role || !requiredRoles.includes(user.role)) {
            throw new ForbiddenException("No tienes permiso");
        }
        return true;
    }
}
