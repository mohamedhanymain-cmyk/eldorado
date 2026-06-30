import * as crypto from "crypto";
import { VALID_STATUS_TRANSITIONS, PAGINATION } from "./constants";

/**
 * Generates a unique internal ID for an account.
 * Format: ELD-YYYYMMDD-XXXXXX (e.g., ELD-20260630-A1B2C3)
 */
export function generateInternalId(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `ELD-${dateStr}-${suffix}`;
}

/**
 * Formats a number as currency string.
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculates profit from purchase and sale prices.
 */
export function calculateProfit(
  purchasePrice: number,
  salePrice: number,
  fees: number = 0
): { profit: number; margin: number } {
  const profit = salePrice - purchasePrice - fees;
  const margin = salePrice > 0 ? (profit / salePrice) * 100 : 0;
  return {
    profit: Math.round(profit * 100) / 100,
    margin: Math.round(margin * 100) / 100,
  };
}

/**
 * Validates if a status transition is allowed.
 */
export function isValidStatusTransition(from: string, to: string): boolean {
  const allowed = VALID_STATUS_TRANSITIONS[from];
  if (!allowed) return false;
  return allowed.includes(to);
}

/**
 * Builds pagination parameters with defaults.
 */
export function buildPagination(query: {
  page?: number;
  limit?: number;
}): { skip: number; take: number; page: number; limit: number } {
  const page = Math.max(1, query.page ?? PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, query.limit ?? PAGINATION.DEFAULT_LIMIT)
  );
  return {
    skip: (page - 1) * limit,
    take: limit,
    page,
    limit,
  };
}

/**
 * Creates pagination metadata from total count and query params.
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
) {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Masks sensitive data for display (e.g., email: j***@example.com).
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}${"*".repeat(Math.min(local.length - 2, 5))}${local[local.length - 1]}@${domain}`;
}

/**
 * Sanitizes an object by removing undefined values.
 */
export function removeUndefined<T extends Record<string, unknown>>(
  obj: T
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

/**
 * Safely parses a Decimal to a number.
 */
export function decimalToNumber(
  value: unknown
): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  return parseFloat(String(value)) || 0;
}

/**
 * Generates a human-readable relative time string.
 */
export function timeAgo(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return then.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
