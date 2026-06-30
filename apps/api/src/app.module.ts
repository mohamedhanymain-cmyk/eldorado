import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { BullModule } from "@nestjs/bullmq";
import { PrismaModule } from "./common/prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { AccountsModule } from "./modules/accounts/accounts.module";
import { SuppliersModule } from "./modules/suppliers/suppliers.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { AuditModule } from "./modules/audit/audit.module";
import { QueueModule } from "./modules/queue/queue.module";
import { WebSocketModule } from "./modules/websocket/websocket.module";
import { EldoradoModule } from "./modules/eldorado/eldorado.module";

@Module({
  imports: [
    // Global config from .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "../../.env"],
    }),

    // BullMQ with Redis
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379", 10),
      },
    }),

    // Core modules
    PrismaModule,
    AuthModule,
    UsersModule,
    AccountsModule,
    SuppliersModule,
    DashboardModule,
    AuditModule,
    QueueModule,
    WebSocketModule,
    EldoradoModule,
  ],
})
export class AppModule {}
