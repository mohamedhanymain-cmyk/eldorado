/** Paginated response wrapper */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** Common query parameters for paginated endpoints */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}

/** Standard API response envelope */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ApiError[];
}

export interface ApiError {
  field?: string;
  message: string;
  code?: string;
}

/** WebSocket event types */
export enum WsEvent {
  INVENTORY_UPDATED = "inventory:updated",
  INVENTORY_CREATED = "inventory:created",
  INVENTORY_DELETED = "inventory:deleted",
  NOTIFICATION_NEW = "notification:new",
  SYNC_STATUS = "sync:status",
  DASHBOARD_REFRESH = "dashboard:refresh",
  USER_ACTIVITY = "user:activity",
}

/** Notification payload */
export interface NotificationPayload {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}
