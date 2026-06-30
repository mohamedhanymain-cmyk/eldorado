import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import type { StringValue } from "ms";
import * as argon2 from "argon2";
import { PrismaService } from "../../common/prisma/prisma.service";
import type {
  LoginDto,
  RegisterDto,
  AuthResponse,
  TokenPayload,
} from "@eldorado/shared";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  /**
   * Authenticate user with email/password, return JWT tokens.
   */
  async login(dto: LoginDto, ipAddress?: string, deviceInfo?: string): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (!user.isActive) {
      throw new UnauthorizedException("Account is deactivated");
    }

    const passwordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordValid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    // Log activity
    await this.prisma.activityLog.create({
      data: {
        userId: user.id,
        description: `User logged in from ${ipAddress || "unknown"}`,
      },
    });

    // Audit log for login
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "LOGIN",
        entity: "User",
        ipAddress: ipAddress || null,
        deviceInfo: deviceInfo || null,
      },
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    };
  }

  /**
   * Register a new user (Owner/Admin only action, enforced by controller guard).
   */
  async register(dto: RegisterDto): Promise<AuthResponse> {
    // Check if email already exists
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException("Email already registered");
    }

    // Hash password with Argon2
    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: (dto.role as "OWNER" | "ADMINISTRATOR" | "MANAGER" | "STAFF" | "VIEWER") || "VIEWER",
      },
    });

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    this.logger.log(`New user registered: ${user.email} (${user.role})`);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    };
  }

  /**
   * Refresh access token using a valid refresh token.
   */
  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const refreshSecret = this.configService.get<string>("JWT_REFRESH_SECRET");
      const payload = this.jwtService.verify(refreshToken, {
        secret: refreshSecret,
      }) as TokenPayload;

      // Verify user still exists and is active
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException("User not found or inactive");
      }

      // Generate new token pair (token rotation)
      return this.generateTokens({
        sub: user.id,
        email: user.email,
        role: user.role,
      });
    } catch {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
  }

  /**
   * Get current user profile.
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return user;
  }

  /**
   * Generate access + refresh token pair.
   */
  private async generateTokens(
    payload: Omit<TokenPayload, "iat" | "exp">
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessExpiry = (this.configService.get<string>("JWT_ACCESS_EXPIRY") || "15m") as StringValue;
    const refreshExpiry = (this.configService.get<string>("JWT_REFRESH_EXPIRY") || "7d") as StringValue;
    const refreshSecret = this.configService.get<string>("JWT_REFRESH_SECRET") || "fallback-refresh-secret";

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload as object, { expiresIn: accessExpiry }),
      this.jwtService.signAsync(payload as object, {
        secret: refreshSecret,
        expiresIn: refreshExpiry,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
