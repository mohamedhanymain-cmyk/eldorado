import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Req,
} from "@nestjs/common";
import { Request } from "express";
import { AuthService } from "./auth.service";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import type { LoginDto, RegisterDto, RefreshTokenDto } from "@eldorado/shared";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const ipAddress =
      (req.headers["x-forwarded-for"] as string) || req.ip || "unknown";
    const deviceInfo = req.headers["user-agent"] || "unknown";
    return this.authService.login(dto, ipAddress, deviceInfo);
  }

  @Roles("OWNER")
  @Post("register")
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Get("me")
  async getProfile(@CurrentUser("id") userId: string) {
    return this.authService.getProfile(userId);
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: { id: string; email: string },
    @Req() req: Request
  ) {
    // Log the logout activity
    // In a full implementation, this would also invalidate the refresh token
    const ipAddress =
      (req.headers["x-forwarded-for"] as string) || req.ip || "unknown";
    return {
      success: true,
      message: `User ${user.email} logged out from ${ipAddress}`,
    };
  }
}
