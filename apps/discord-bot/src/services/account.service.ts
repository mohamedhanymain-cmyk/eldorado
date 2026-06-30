import { prisma } from "@eldorado/database";
import { encryptField, generateInternalId } from "@eldorado/shared";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "";

export interface StockSummary {
  total: number;
  available: number;
  reserved: number;
  sold: number;
  platforms: { platform: string; count: number }[];
}

export interface BotStats {
  totalAccounts: number;
  totalRevenue: number;
  totalProfit: number;
  availableCount: number;
  soldCount: number;
}

export const accountService = {
  async getStockSummary(platform?: string): Promise<StockSummary> {
    const where = platform
      ? { platform: { contains: platform, mode: "insensitive" as const } }
      : {};

    const [total, available, reserved, sold, platforms] = await Promise.all([
      prisma.account.count({ where }),
      prisma.account.count({ where: { ...where, status: "AVAILABLE" } }),
      prisma.account.count({ where: { ...where, status: "RESERVED" } }),
      prisma.account.count({ where: { ...where, status: "SOLD" } }),
      prisma.account.groupBy({
        by: ["platform"],
        where,
        _count: { platform: true },
        orderBy: { _count: { platform: "desc" } },
        take: 10,
      }),
    ]);

    return {
      total,
      available,
      reserved,
      sold,
      platforms: platforms.map((p) => ({
        platform: p.platform,
        count: p._count.platform,
      })),
    };
  },

  async createFromBot(data: {
    platform: string;
    category: string;
    email: string;
    password: string;
    purchasePrice: number;
    expectedSalePrice: number;
  }) {
    const internalId = generateInternalId();
    const encryptedPassword =
      ENCRYPTION_KEY.length === 64
        ? encryptField(data.password, ENCRYPTION_KEY)
        : data.password;

    const account = await prisma.account.create({
      data: {
        internalId,
        platform: data.platform,
        category: data.category,
        email: data.email,
        password: encryptedPassword,
        purchasePrice: data.purchasePrice,
        expectedSalePrice: data.expectedSalePrice,
        status: "PENDING_VERIFICATION",
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        description: `Account ${internalId} added via Discord bot (${data.platform})`,
      },
    });

    return account;
  },

  async sellByInternalId(internalId: string, salePrice: number) {
    const account = await prisma.account.findUnique({
      where: { internalId },
    });

    if (!account) throw new Error(`Account ${internalId} not found`);
    if (account.status !== "AVAILABLE" && account.status !== "RESERVED") {
      throw new Error(
        `Cannot sell account in ${account.status} status. Must be AVAILABLE or RESERVED.`
      );
    }

    const updated = await prisma.account.update({
      where: { id: account.id, version: account.version },
      data: {
        status: "SOLD",
        actualSalePrice: salePrice,
        version: { increment: 1 },
      },
    });

    await prisma.activityLog.create({
      data: {
        description: `Account ${internalId} sold for $${salePrice.toFixed(2)} via Discord bot`,
      },
    });

    return updated;
  },

  async reserveByInternalId(internalId: string) {
    const account = await prisma.account.findUnique({
      where: { internalId },
    });

    if (!account) throw new Error(`Account ${internalId} not found`);
    if (account.status !== "AVAILABLE") {
      throw new Error(
        `Cannot reserve account in ${account.status} status. Must be AVAILABLE.`
      );
    }

    const updated = await prisma.account.update({
      where: { id: account.id, version: account.version },
      data: { status: "RESERVED", version: { increment: 1 } },
    });

    await prisma.activityLog.create({
      data: {
        description: `Account ${internalId} reserved via Discord bot`,
      },
    });

    return updated;
  },

  async search(
    query: string,
    status?: string
  ) {
    const where: Record<string, unknown> = {
      OR: [
        { internalId: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { platform: { contains: query, mode: "insensitive" } },
        { username: { contains: query, mode: "insensitive" } },
      ],
    };

    if (status) where.status = status;

    return prisma.account.findMany({
      where,
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { supplier: { select: { name: true } } },
    });
  },

  async getStats(): Promise<BotStats> {
    const [totalAccounts, availableCount, soldAccounts] = await Promise.all([
      prisma.account.count(),
      prisma.account.count({ where: { status: "AVAILABLE" } }),
      prisma.account.findMany({
        where: { status: "SOLD", actualSalePrice: { not: null } },
        select: { purchasePrice: true, actualSalePrice: true },
      }),
    ]);

    let totalRevenue = 0;
    let totalProfit = 0;
    for (const sale of soldAccounts) {
      const salePrice = Number(sale.actualSalePrice);
      const purchasePrice = Number(sale.purchasePrice);
      totalRevenue += salePrice;
      totalProfit += salePrice - purchasePrice;
    }

    return {
      totalAccounts,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100,
      availableCount,
      soldCount: soldAccounts.length,
    };
  },
};
