import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { buildPagination, buildPaginationMeta } from "@eldorado/shared";
import type {
  AuditLogResponseDto,
  ActivityLogResponseDto,
  AuditLogFilterQuery,
  PaginatedResponse,
} from "@eldorado/shared";

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async getAuditLogs(
    query: AuditLogFilterQuery
  ): Promise<PaginatedResponse<AuditLogResponseDto>> {
    const { skip, take, page, limit } = buildPagination(query);

    const where: Record<string, unknown> = {};
    if (query.userId) where.userId = query.userId;
    if (query.entity) where.entity = query.entity;
    if (query.action) where.action = query.action;
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {
        ...(query.dateFrom && { gte: new Date(query.dateFrom) }),
        ...(query.dateTo && { lte: new Date(query.dateTo) }),
      };
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: { user: { select: { email: true } } },
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    const data: AuditLogResponseDto[] = logs.map((log) => ({
      id: log.id,
      userId: log.userId,
      userEmail: log.user.email,
      action: log.action,
      entity: log.entity,
      oldValue: log.oldValue as unknown as Record<string, unknown> | null,
      newValue: log.newValue as unknown as Record<string, unknown> | null,
      ipAddress: log.ipAddress,
      deviceInfo: log.deviceInfo,
      createdAt: log.createdAt.toISOString(),
    }));

    return {
      data,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async getActivityLogs(
    query: AuditLogFilterQuery
  ): Promise<PaginatedResponse<ActivityLogResponseDto>> {
    const { skip, take, page, limit } = buildPagination(query);

    const where: Record<string, unknown> = {};
    if (query.userId) where.userId = query.userId;

    const [logs, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        include: { user: { select: { email: true } } },
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    const data: ActivityLogResponseDto[] = logs.map((log) => ({
      id: log.id,
      userId: log.userId,
      userEmail: log.user?.email || null,
      description: log.description,
      createdAt: log.createdAt.toISOString(),
    }));

    return {
      data,
      meta: buildPaginationMeta(total, page, limit),
    };
  }
}
