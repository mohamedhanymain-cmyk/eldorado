import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import * as argon2 from "argon2";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { CreateUserDto, UpdateUserDto, UserResponseDto } from "@eldorado/shared";
import { buildPagination, buildPaginationMeta } from "@eldorado/shared";
import type { PaginationQuery, PaginatedResponse } from "@eldorado/shared";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: PaginationQuery
  ): Promise<PaginatedResponse<UserResponseDto>> {
    const { skip, take, page, limit } = buildPagination(query);

    const where = query.search
      ? { email: { contains: query.search, mode: "insensitive" as const } }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take,
        orderBy: { createdAt: query.sortOrder || "desc" },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
      })),
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
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
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException("Email already registered");
    }

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
        role: dto.role as "OWNER" | "ADMINISTRATOR" | "MANAGER" | "STAFF" | "VIEWER",
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    await this.findById(id); // Throws if not found

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.email && { email: dto.email }),
        ...(dto.role && { role: dto.role as "OWNER" | "ADMINISTRATOR" | "MANAGER" | "STAFF" | "VIEWER" }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async deactivate(id: string): Promise<UserResponseDto> {
    return this.update(id, { isActive: false });
  }

  async forceResetPassword(
    id: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    await this.findById(id);

    const passwordHash = await argon2.hash(newPassword, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    return { success: true, message: "Password has been reset" };
  }
}
