import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: process.env.API_CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  },
  namespace: "/events",
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(EventsGateway.name);
  private connectedClients = new Map<string, Socket>();

  afterInit() {
    this.logger.log("WebSocket Gateway initialized");
  }

  handleConnection(client: Socket) {
    this.connectedClients.set(client.id, client);
    this.logger.log(
      `Client connected: ${client.id} (${this.connectedClients.size} total)`
    );
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.logger.log(
      `Client disconnected: ${client.id} (${this.connectedClients.size} total)`
    );
  }

  /**
   * Emit an event to all connected clients.
   */
  emitToAll(event: string, data: unknown) {
    this.server.emit(event, data);
  }

  /**
   * Emit inventory update events.
   */
  emitInventoryUpdate(data: {
    type: "created" | "updated" | "deleted";
    account: unknown;
  }) {
    this.server.emit(`inventory:${data.type}`, data.account);
  }

  /**
   * Emit real-time notification.
   */
  emitNotification(data: {
    type: string;
    title: string;
    message: string;
  }) {
    this.server.emit("notification:new", {
      ...data,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
    });
  }

  /**
   * Emit sync status update.
   */
  emitSyncStatus(data: { status: string; progress: number; message: string }) {
    this.server.emit("sync:status", data);
  }

  /**
   * Emit dashboard refresh signal.
   */
  emitDashboardRefresh() {
    this.server.emit("dashboard:refresh", { timestamp: new Date().toISOString() });
  }
}
