import { PrismaClient } from "@prisma/client";

// Re-export all Prisma types and enums
export { PrismaClient } from "@prisma/client";
export type {
  User,
  Supplier,
  Account,
  AuditLog,
  ActivityLog,
} from "@prisma/client";
export { AccountStatus, RoleType } from "@prisma/client";
export type { Prisma } from "@prisma/client";

// Singleton PrismaClient instance
// In development, use a global variable to prevent multiple instances during HMR
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
