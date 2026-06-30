import { Controller, Get, Query } from "@nestjs/common";
import { AuditService } from "./audit.service";
import { Roles } from "../../common/decorators/roles.decorator";
import type { AuditLogFilterQuery } from "@eldorado/shared";

@Controller("audit")
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Roles("MANAGER")
  @Get("logs")
  getAuditLogs(@Query() query: AuditLogFilterQuery) {
    return this.auditService.getAuditLogs(query);
  }

  @Roles("VIEWER")
  @Get("activity")
  getActivityLogs(@Query() query: AuditLogFilterQuery) {
    return this.auditService.getActivityLogs(query);
  }
}
