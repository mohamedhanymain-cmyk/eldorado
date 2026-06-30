import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
} from "@nestjs/common";
import { SuppliersService } from "./suppliers.service";
import { Roles } from "../../common/decorators/roles.decorator";
import type {
  CreateSupplierDto,
  UpdateSupplierDto,
  PaginationQuery,
} from "@eldorado/shared";

@Controller("suppliers")
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Roles("VIEWER")
  @Get()
  findAll(@Query() query: PaginationQuery) {
    return this.suppliersService.findAll(query);
  }

  @Roles("VIEWER")
  @Get(":id")
  findById(@Param("id") id: string) {
    return this.suppliersService.findById(id);
  }

  @Roles("MANAGER")
  @Post()
  create(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(dto);
  }

  @Roles("MANAGER")
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateSupplierDto) {
    return this.suppliersService.update(id, dto);
  }

  @Roles("ADMINISTRATOR")
  @Post(":id/blacklist")
  toggleBlacklist(@Param("id") id: string) {
    return this.suppliersService.toggleBlacklist(id);
  }

  @Roles("VIEWER")
  @Get(":id/accounts")
  getSupplierAccounts(
    @Param("id") id: string,
    @Query() query: PaginationQuery
  ) {
    return this.suppliersService.getSupplierAccounts(id, query);
  }
}
