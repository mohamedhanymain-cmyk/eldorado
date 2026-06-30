import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import {
  buildPagination,
  buildPaginationMeta,
  decimalToNumber,
} from "@eldorado/shared";
import type {
  CreateSupplierDto,
  UpdateSupplierDto,
  SupplierResponseDto,
  PaginationQuery,
  PaginatedResponse,
} from "@eldorado/shared";

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: PaginationQuery
  ): Promise<PaginatedResponse<SupplierResponseDto>> {
    const { skip, take, page, limit } = buildPagination(query);

    const where = query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" as const } },
            { email: { contains: query.search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [suppliers, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        include: { _count: { select: { accounts: true } } },
        skip,
        take,
        orderBy: { [query.sortBy || "createdAt"]: query.sortOrder || "desc" },
      }),
      this.prisma.supplier.count({ where }),
    ]);

    const data = suppliers.map((s) => this.toResponseDto(s));

    return {
      data,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async findById(id: string): Promise<SupplierResponseDto> {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: { _count: { select: { accounts: true } } },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    return this.toResponseDto(supplier);
  }

  async create(dto: CreateSupplierDto): Promise<SupplierResponseDto> {
    const supplier = await this.prisma.supplier.create({
      data: {
        name: dto.name,
        email: dto.email || null,
        trustScore: dto.trustScore ?? 100,
        notes: dto.notes || null,
      },
      include: { _count: { select: { accounts: true } } },
    });

    return this.toResponseDto(supplier);
  }

  async update(
    id: string,
    dto: UpdateSupplierDto
  ): Promise<SupplierResponseDto> {
    await this.findById(id);

    const supplier = await this.prisma.supplier.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.trustScore !== undefined && { trustScore: dto.trustScore }),
        ...(dto.isBlacklisted !== undefined && {
          isBlacklisted: dto.isBlacklisted,
        }),
        ...(dto.balance !== undefined && { balance: dto.balance }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      include: { _count: { select: { accounts: true } } },
    });

    return this.toResponseDto(supplier);
  }

  async toggleBlacklist(
    id: string
  ): Promise<SupplierResponseDto> {
    const current = await this.prisma.supplier.findUnique({
      where: { id },
      select: { isBlacklisted: true },
    });
    if (!current) throw new NotFoundException(`Supplier ${id} not found`);

    return this.update(id, { isBlacklisted: !current.isBlacklisted });
  }

  async getSupplierAccounts(id: string, query: PaginationQuery) {
    await this.findById(id);
    const { skip, take, page, limit } = buildPagination(query);

    const [accounts, total] = await Promise.all([
      this.prisma.account.findMany({
        where: { supplierId: id },
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.account.count({ where: { supplierId: id } }),
    ]);

    return {
      data: accounts,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  private toResponseDto(
    supplier: Record<string, unknown> & {
      _count?: { accounts: number };
    }
  ): SupplierResponseDto {
    return {
      id: supplier.id as string,
      name: supplier.name as string,
      email: (supplier.email as string) || null,
      trustScore: supplier.trustScore as number,
      isBlacklisted: supplier.isBlacklisted as boolean,
      balance: decimalToNumber(supplier.balance),
      notes: (supplier.notes as string) || null,
      accountCount: supplier._count?.accounts ?? 0,
      createdAt: (supplier.createdAt as Date).toISOString(),
      updatedAt: (supplier.updatedAt as Date).toISOString(),
    };
  }
}
