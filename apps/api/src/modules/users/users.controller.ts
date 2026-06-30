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
import { UsersService } from "./users.service";
import { Roles } from "../../common/decorators/roles.decorator";
import type {
  CreateUserDto,
  UpdateUserDto,
  ForceResetPasswordDto,
  PaginationQuery,
} from "@eldorado/shared";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles("ADMINISTRATOR")
  @Get()
  findAll(@Query() query: PaginationQuery) {
    return this.usersService.findAll(query);
  }

  @Roles("ADMINISTRATOR")
  @Get(":id")
  findById(@Param("id") id: string) {
    return this.usersService.findById(id);
  }

  @Roles("OWNER")
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Roles("OWNER")
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Roles("OWNER")
  @Delete(":id")
  deactivate(@Param("id") id: string) {
    return this.usersService.deactivate(id);
  }

  @Roles("OWNER")
  @Post(":id/reset-password")
  forceResetPassword(
    @Param("id") id: string,
    @Body() dto: ForceResetPasswordDto
  ) {
    return this.usersService.forceResetPassword(id, dto.newPassword);
  }
}
