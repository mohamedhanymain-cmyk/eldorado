import { Controller, Get, Post } from "@nestjs/common";
import { EldoradoService } from "./eldorado.service";
import { Roles } from "../../common/decorators/roles.decorator";

@Controller("eldorado")
export class EldoradoController {
  constructor(private readonly eldoradoService: EldoradoService) {}

  @Roles("ADMINISTRATOR")
  @Get("status")
  getStatus() {
    return this.eldoradoService.getStatus();
  }

  @Roles("ADMINISTRATOR")
  @Post("sync")
  async triggerSync() {
    const [listings, orders, sales] = await Promise.all([
      this.eldoradoService.syncListings(),
      this.eldoradoService.syncOrders(),
      this.eldoradoService.syncSales(),
    ]);

    return {
      listings,
      orders,
      sales,
      triggeredAt: new Date().toISOString(),
    };
  }
}
