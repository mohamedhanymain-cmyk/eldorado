/** Audit action enum — tracks what type of action was performed */
export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  RESERVE = "RESERVE",
  SELL = "SELL",
  REFUND = "REFUND",
  BLACKLIST = "BLACKLIST",
  IMPORT = "IMPORT",
  EXPORT = "EXPORT",
  SYNC = "SYNC",
  PASSWORD_RESET = "PASSWORD_RESET",
  ROLE_CHANGE = "ROLE_CHANGE",
  STATUS_CHANGE = "STATUS_CHANGE",
}

/** Audit entity types */
export enum AuditEntity {
  USER = "User",
  ACCOUNT = "Account",
  SUPPLIER = "Supplier",
  SYSTEM = "System",
}

/** Audit log response DTO */
export interface AuditLogResponseDto {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  entity: string;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  ipAddress: string | null;
  deviceInfo: string | null;
  createdAt: string;
}

/** Activity log response DTO */
export interface ActivityLogResponseDto {
  id: string;
  userId: string | null;
  userEmail: string | null;
  description: string;
  createdAt: string;
}

/** Audit log filter query */
export interface AuditLogFilterQuery {
  page?: number;
  limit?: number;
  userId?: string;
  entity?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
}
