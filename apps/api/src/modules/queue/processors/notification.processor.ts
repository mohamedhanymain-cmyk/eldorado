import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";

@Processor("notification")
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  async process(
    job: Job<{
      type: string;
      title: string;
      message: string;
      userId?: string;
    }>
  ): Promise<{ delivered: boolean }> {
    this.logger.log(`Processing notification: ${job.data.title}`);

    // In production: emit via WebSocket gateway, send email, or push notification
    // For now, log the notification
    this.logger.log(
      `[${job.data.type}] ${job.data.title}: ${job.data.message}`
    );

    return { delivered: true };
  }
}
