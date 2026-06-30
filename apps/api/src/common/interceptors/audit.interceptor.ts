import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@eldorado/database";

/**
 * Audit interceptor that automatically logs every mutation (POST, PUT, PATCH, DELETE)
 * to the AuditLog table. Captures: user, action, entity, old/new values, IP, device.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const method = request.method as string;

    // Only audit mutations
    if (["GET", "HEAD", "OPTIONS"].includes(method)) {
      return next.handle();
    }

    const user = request.user as
      | { id: string; email: string; role: string }
      | undefined;
    const ipAddress =
      request.ip ||
      request.headers["x-forwarded-for"] ||
      request.connection?.remoteAddress ||
      "unknown";
    const deviceInfo = request.headers["user-agent"] || "unknown";

    // Determine action and entity from route
    const path = request.route?.path || request.url || "";
    const action = this.mapMethodToAction(method);
    const entity = this.extractEntity(path);

    return next.handle().pipe(
      tap(async (responseData) => {
        // Only log if we have an authenticated user
        if (!user?.id) return;

        try {
          await this.prisma.auditLog.create({
            data: {
              userId: user.id,
              action,
              entity,
              oldValue: (request.body?._oldValue ?? null) as Prisma.InputJsonValue,
              newValue: this.sanitizeForAudit(responseData),
              ipAddress: String(ipAddress),
              deviceInfo: String(deviceInfo),
            },
          });
        } catch (error) {
          // Audit logging should never break the main request
          console.error("Audit log error:", error);
        }
      })
    );
  }

  private mapMethodToAction(method: string): string {
    switch (method) {
      case "POST":
        return "CREATE";
      case "PUT":
      case "PATCH":
        return "UPDATE";
      case "DELETE":
        return "DELETE";
      default:
        return method;
    }
  }

  private extractEntity(path: string): string {
    // Extract entity name from path: /api/accounts/:id → Account
    const segments = path.split("/").filter(Boolean);
    const entitySegment = segments.find(
      (s) => !s.startsWith(":") && s !== "api"
    );
    if (!entitySegment) return "Unknown";
    // Capitalize and singularize
    const singular = entitySegment.endsWith("s")
      ? entitySegment.slice(0, -1)
      : entitySegment;
    return singular.charAt(0).toUpperCase() + singular.slice(1);
  }

  private sanitizeForAudit(data: unknown): Prisma.InputJsonValue {
    if (!data || typeof data !== "object") return null;
    const sanitized = { ...(data as Record<string, unknown>) };
    // Remove sensitive fields from audit logs
    delete sanitized["password"];
    delete sanitized["passwordHash"];
    delete sanitized["recoveryPassword"];
    delete sanitized["accessToken"];
    delete sanitized["refreshToken"];
    return sanitized as Prisma.InputJsonObject;
  }
}
