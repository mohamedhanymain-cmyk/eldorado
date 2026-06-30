import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { ROLE_HIERARCHY } from "@eldorado/shared";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No roles specified = any authenticated user can access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as { role: string } | undefined;

    if (!user) {
      throw new ForbiddenException("User not authenticated");
    }

    const userLevel = ROLE_HIERARCHY[user.role] ?? -1;

    // Check if user's role level meets any of the required roles
    const hasRole = requiredRoles.some((role) => {
      const requiredLevel = ROLE_HIERARCHY[role] ?? Infinity;
      return userLevel >= requiredLevel;
    });

    if (!hasRole) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredRoles.join(" or ")}. Your role: ${user.role}`
      );
    }

    return true;
  }
}
