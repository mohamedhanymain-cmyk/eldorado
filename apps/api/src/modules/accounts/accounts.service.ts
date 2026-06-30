import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../common/prisma/prisma.service";
import {
  encryptField,
  decryptField,
  generateInternalId,
  isValidStatusTransition,
  buildPagination,
  buildPaginationMeta,
  decimalToNumber,
} from "@eldorado/shared";
import type {
  CreateAccountDto,
  UpdateAccountDto,
  AccountResponseDto,
  AccountFilterQuery,
  ReserveAccountDto,
  SellAccountDto,
  PaginatedResponse,
} from "@eldorado/shared";

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);
  private readonly encryptionKey: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {
    this.encryptionKey = this.configService.get<string>("ENCRYPTION_KEY", "");
    if (!this.encryptionKey || this.encryptionKey.length !== 64) {
      this.logger.warn(
        "ENCRYPTION_KEY is not set or invalid. Sensitive fields will NOT be encrypted!"
      );
    }
  }

  /**
   * List accounts with pagination, filtering, and search.
   */
  async findAll(
    query: AccountFilterQuery
  ): Promise<PaginatedResponse<AccountResponseDto>> {
    const { skip, take, page, limit } = buildPagination(query);

    const where: Record<string, unknown> = {};

    if (query.status) where.status = query.status;
    if (query.platform) where.platform = { contains: query.platform, mode: "insensitive" };
    if (query.category) where.category = query.category;
    if (query.supplierId) where.supplierId = query.supplierId;
    if (query.search) {
      where.OR = [
        { internalId: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
        { username: { contains: query.search, mode: "insensitive" } },
        { platform: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [accounts, total] = await Promise.all([
      this.prisma.account.findMany({
        where,
        include: { supplier: { select: { name: true } } },
        skip,
        take,
        orderBy: {
          [query.sortBy || "createdAt"]: query.sortOrder || "desc",
        },
      }),
      this.prisma.account.count({ where }),
    ]);

    const data = accounts.map((a) => this.toResponseDto(a));

    return {
      data,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  /**
   * Get a single account by ID, decrypting sensitive fields.
   */
  async findById(id: string): Promise<AccountResponseDto> {
    const account = await this.prisma.account.findUnique({
      where: { id },
      include: { supplier: { select: { name: true } } },
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return this.toResponseDto(account);
  }

  /**
   * Create a new account with auto-generated internal ID and encrypted sensitive fields.
   */
  async create(dto: CreateAccountDto): Promise<AccountResponseDto> {
    const internalId = generateInternalId();

    // Encrypt sensitive fields
    const encryptedPassword = this.encrypt(dto.password);
    const encryptedRecoveryPassword = dto.recoveryPassword
      ? this.encrypt(dto.recoveryPassword)
      : null;

    const account = await this.prisma.account.create({
      data: {
        internalId,
        platform: dto.platform,
        category: dto.category,
        email: dto.email,
        password: encryptedPassword,
        recoveryEmail: dto.recoveryEmail || null,
        recoveryPassword: encryptedRecoveryPassword,
        username: dto.username || null,
        twoFactorStatus: dto.twoFactorStatus || false,
        purchasePrice: dto.purchasePrice,
        expectedSalePrice: dto.expectedSalePrice,
        status: (dto.status as "PENDING_VERIFICATION") || "PENDING_VERIFICATION",
        supplierId: dto.supplierId || null,
      },
      include: { supplier: { select: { name: true } } },
    });

    this.logger.log(`Account created: ${internalId} (${dto.platform})`);
    return this.toResponseDto(account);
  }

  /**
   * Update an account with optimistic locking.
   * The caller must provide the current `version` — if it doesn't match, a ConflictException is thrown.
   */
  async update(
    id: string,
    dto: UpdateAccountDto
  ): Promise<AccountResponseDto> {
    // Validate status transition if status is being changed
    if (dto.status) {
      const current = await this.prisma.account.findUnique({
        where: { id },
        select: { status: true },
      });
      if (current && !isValidStatusTransition(current.status, dto.status)) {
        throw new BadRequestException(
          `Invalid status transition: ${current.status} → ${dto.status}`
        );
      }
    }

    // Build update data, encrypting sensitive fields if present
    const updateData: Record<string, unknown> = {};
    if (dto.platform !== undefined) updateData.platform = dto.platform;
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.password !== undefined) updateData.password = this.encrypt(dto.password);
    if (dto.recoveryEmail !== undefined) updateData.recoveryEmail = dto.recoveryEmail;
    if (dto.recoveryPassword !== undefined) {
      updateData.recoveryPassword = this.encrypt(dto.recoveryPassword);
    }
    if (dto.username !== undefined) updateData.username = dto.username;
    if (dto.twoFactorStatus !== undefined) updateData.twoFactorStatus = dto.twoFactorStatus;
    if (dto.purchasePrice !== undefined) updateData.purchasePrice = dto.purchasePrice;
    if (dto.expectedSalePrice !== undefined) updateData.expectedSalePrice = dto.expectedSalePrice;
    if (dto.actualSalePrice !== undefined) updateData.actualSalePrice = dto.actualSalePrice;
    if (dto.supplierId !== undefined) updateData.supplierId = dto.supplierId;
    if (dto.status !== undefined) updateData.status = dto.status;

    // Optimistic locking: increment version and match current version in WHERE clause
    try {
      const account = await this.prisma.account.update({
        where: {
          id,
          version: dto.version, // Optimistic lock check
        },
        data: {
          ...updateData,
          version: { increment: 1 },
        },
        include: { supplier: { select: { name: true } } },
      });

      return this.toResponseDto(account);
    } catch (error: unknown) {
      // Prisma throws P2025 when the WHERE clause matches 0 records
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error as { code: string }).code === "P2025"
      ) {
        throw new ConflictException(
          "Record was modified by another user. Please refresh and try again. " +
            `Expected version: ${dto.version}`
        );
      }
      throw error;
    }
  }

  /**
   * Reserve an account — changes status to RESERVED.
   */
  async reserve(
    id: string,
    dto: ReserveAccountDto
  ): Promise<AccountResponseDto> {
    return this.update(id, {
      status: "RESERVED",
      version: dto.version,
    });
  }

  /**
   * Sell an account — changes status to SOLD and records sale price.
   */
  async sell(id: string, dto: SellAccountDto): Promise<AccountResponseDto> {
    return this.update(id, {
      status: "SOLD",
      actualSalePrice: dto.actualSalePrice,
      version: dto.version,
    });
  }

  /**
   * Soft-delete: mark as DISABLED.
   */
  async remove(id: string, version: number): Promise<AccountResponseDto> {
    return this.update(id, { status: "DISABLED", version });
  }

  // ── Private Helpers ───────────────────────────────────────

  private encrypt(value: string): string {
    if (!this.encryptionKey || this.encryptionKey.length !== 64) return value;
    return encryptField(value, this.encryptionKey);
  }

  private decrypt(value: string): string {
    if (!this.encryptionKey || this.encryptionKey.length !== 64) return value;
    try {
      return decryptField(value, this.encryptionKey);
    } catch {
      // If decryption fails (e.g., old unencrypted data), return as-is
      return value;
    }
  }

  private toResponseDto(
    account: Record<string, unknown> & {
      supplier?: { name: string } | null;
    }
  ): AccountResponseDto {
    return {
      id: account.id as string,
      internalId: account.internalId as string,
      platform: account.platform as string,
      category: account.category as string,
      email: account.email as string,
      password: this.decrypt(account.password as string),
      recoveryEmail: (account.recoveryEmail as string) || null,
      recoveryPassword: account.recoveryPassword
        ? this.decrypt(account.recoveryPassword as string)
        : null,
      username: (account.username as string) || null,
      twoFactorStatus: account.twoFactorStatus as boolean,
      purchasePrice: decimalToNumber(account.purchasePrice),
      expectedSalePrice: decimalToNumber(account.expectedSalePrice),
      actualSalePrice: account.actualSalePrice
        ? decimalToNumber(account.actualSalePrice)
        : null,
      status: account.status as string,
      version: account.version as number,
      supplierId: (account.supplierId as string) || null,
      supplierName: account.supplier?.name || null,
      createdAt: (account.createdAt as Date).toISOString(),
      updatedAt: (account.updatedAt as Date).toISOString(),
    };
  }
}
