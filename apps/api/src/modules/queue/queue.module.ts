import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { EldoradoSyncProcessor } from "./processors/eldorado-sync.processor";
import { NotificationProcessor } from "./processors/notification.processor";
import { ExportProcessor } from "./processors/export.processor";

@Module({
  imports: [
    BullModule.registerQueue(
      { name: "eldorado-sync" },
      { name: "notification" },
      { name: "export" }
    ),
  ],
  providers: [EldoradoSyncProcessor, NotificationProcessor, ExportProcessor],
  exports: [BullModule],
})
export class QueueModule {}
