import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";

@Processor("eldorado-sync", {
  concurrency: 2,
  limiter: {
    max: 10,
    duration: 60000, // 10 requests per minute — rate limiting
  },
})
export class EldoradoSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(EldoradoSyncProcessor.name);

  async process(job: Job<{ type: string; payload?: unknown }>): Promise<unknown> {
    this.logger.log(`Processing Eldorado sync job: ${job.name} (${job.id})`);

    try {
      switch (job.data.type) {
        case "sync-listings":
          return this.syncListings(job);
        case "sync-orders":
          return this.syncOrders(job);
        case "sync-sales":
          return this.syncSales(job);
        default:
          this.logger.warn(`Unknown sync job type: ${job.data.type}`);
          return { status: "skipped", reason: "unknown type" };
      }
    } catch (error) {
      this.logger.error(`Sync job failed: ${error}`);
      throw error; // BullMQ will retry based on queue config
    }
  }

  private async syncListings(job: Job): Promise<{ status: string; synced: number }> {
    this.logger.log("Syncing Eldorado listings...");
    // In production: call EldoradoService.syncListings()
    await job.updateProgress(50);
    await job.updateProgress(100);
    return { status: "completed", synced: 0 };
  }

  private async syncOrders(job: Job): Promise<{ status: string; synced: number }> {
    this.logger.log("Syncing Eldorado orders...");
    await job.updateProgress(100);
    return { status: "completed", synced: 0 };
  }

  private async syncSales(job: Job): Promise<{ status: string; synced: number }> {
    this.logger.log("Syncing Eldorado sales...");
    await job.updateProgress(100);
    return { status: "completed", synced: 0 };
  }
}
