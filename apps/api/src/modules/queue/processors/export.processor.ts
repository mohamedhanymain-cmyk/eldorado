import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { PrismaService } from "../../../common/prisma/prisma.service";

@Processor("export")
export class ExportProcessor extends WorkerHost {
  private readonly logger = new Logger(ExportProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(
    job: Job<{ entity: string; filters?: Record<string, unknown>; format: string }>
  ): Promise<{ filePath: string; rowCount: number }> {
    this.logger.log(
      `Exporting ${job.data.entity} as ${job.data.format}...`
    );

    try {
      let rowCount = 0;

      switch (job.data.entity) {
        case "accounts": {
          const accounts = await this.prisma.account.findMany({
            include: { supplier: { select: { name: true } } },
          });
          rowCount = accounts.length;
          // In production: generate CSV/Excel file and store it
          break;
        }
        case "audit-logs": {
          const logs = await this.prisma.auditLog.findMany({
            include: { user: { select: { email: true } } },
          });
          rowCount = logs.length;
          break;
        }
        default:
          this.logger.warn(`Unknown export entity: ${job.data.entity}`);
      }

      await job.updateProgress(100);

      const filePath = `/exports/${job.data.entity}_${Date.now()}.${job.data.format}`;
      return { filePath, rowCount };
    } catch (error) {
      this.logger.error(`Export failed: ${error}`);
      throw error;
    }
  }
}
