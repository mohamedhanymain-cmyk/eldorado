import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";

/**
 * Decorator to specify minimum role required to access an endpoint.
 * Uses hierarchical check: OWNER > ADMINISTRATOR > MANAGER > STAFF > VIEWER
 *
 * @example @Roles('MANAGER') — allows MANAGER, ADMINISTRATOR, and OWNER
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
