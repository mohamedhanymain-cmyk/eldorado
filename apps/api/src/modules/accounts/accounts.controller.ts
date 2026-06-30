import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from "@nestjs/common";
import { AccountsService } from "./accounts.service";
import { Roles } from "../../common/decorators/roles.decorator";
import type {
  CreateAccountDto,
  UpdateAccountDto,
  AccountFilterQuery,
  ReserveAccountDto,
  SellAccountDto,
} from "@eldorado/shared";

@Controller("accounts")
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Roles("VIEWER")
  @Get()
  findAll(@Query() query: AccountFilterQuery) {
    return this.accountsService.findAll(query);
  }

  @Roles("VIEWER")
  @Get(":id")
  findById(@Param("id") id: string) {
    return this.accountsService.findById(id);
  }

  @Roles("STAFF")
  @Post()
  create(@Body() dto: CreateAccountDto) {
    return this.accountsService.create(dto);
  }

  @Roles("STAFF")
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateAccountDto) {
    return this.accountsService.update(id, dto);
  }

  @Roles("MANAGER")
  @Delete(":id")
  remove(@Param("id") id: string, @Body("version") version: number) {
    return this.accountsService.remove(id, version);
  }

  @Roles("STAFF")
  @Post(":id/reserve")
  reserve(@Param("id") id: string, @Body() dto: ReserveAccountDto) {
    return this.accountsService.reserve(id, dto);
  }

  @Roles("STAFF")
  @Post(":id/sell")
  sell(@Param("id") id: string, @Body() dto: SellAccountDto) {
    return this.accountsService.sell(id, dto);
  }
}
