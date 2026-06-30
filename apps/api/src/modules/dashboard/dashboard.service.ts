import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { decimalToNumber } from "@eldorado/shared";
import type { DashboardStats } from "@eldorado/shared";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(): Promise<DashboardStats> {
    const [
      totalAccounts,
      accountsByStatus,
      soldAccounts,
      availableAccounts,
      topPlatforms,
      topSuppliers,
      recentActivity,
    ] = await Promise.all([
      this.prisma.account.count(),
      this.prisma.account.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      this.prisma.account.findMany({
        where: { status: "SOLD", actualSalePrice: { not: null } },
        select: { purchasePrice: true, actualSalePrice: true },
      }),
      this.prisma.account.findMany({
        where: { status: { in: ["AVAILABLE", "RESERVED", "PENDING_VERIFICATION"] } },
        select: { purchasePrice: true, expectedSalePrice: true },
      }),
      this.prisma.account.groupBy({
        by: ["platform"],
        _count: { platform: true },
        _sum: { actualSalePrice: true },
      }),
      this.prisma.supplier.findMany({
        include: { _count: { select: { accounts: true } } },
        orderBy: { trustScore: "desc" },
        take: 5,
      }),
      this.prisma.activityLog.findMany({
        include: { user: { select: { email: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    // Calculate revenue and profit
    let totalRevenue = 0;
    let totalProfit = 0;
    for (const sale of soldAccounts) {
      const salePrice = decimalToNumber(sale.actualSalePrice);
      const purchasePrice = decimalToNumber(sale.purchasePrice);
      totalRevenue += salePrice;
      totalProfit += salePrice - purchasePrice;
    }

    // Calculate inventory value (sum of expected sale prices for in-stock items)
    let inventoryValue = 0;
    for (const acc of availableAccounts) {
      inventoryValue += decimalToNumber(acc.expectedSalePrice);
    }

    // Status breakdown with percentages
    const statusBreakdown = accountsByStatus.map((s) => ({
      status: s.status,
      count: s._count.status,
      percentage:
        totalAccounts > 0
          ? Math.round((s._count.status / totalAccounts) * 100)
          : 0,
    }));

    // Top platforms
    const platformBreakdown = topPlatforms.map((p) => ({
      platform: p.platform,
      totalAccounts: p._count.platform,
      available: 0, // Would need additional queries for full breakdown
      sold: 0,
      revenue: decimalToNumber(p._sum.actualSalePrice),
    }));

    // Top suppliers
    const supplierBreakdown = topSuppliers.map((s) => ({
      supplierId: s.id,
      supplierName: s.name,
      totalAccounts: s._count.accounts,
      trustScore: s.trustScore,
      totalSpent: decimalToNumber(s.balance),
      totalRevenue: 0,
    }));

    // Recent activity
    const activityItems = recentActivity.map((a) => ({
      id: a.id,
      description: a.description,
      userEmail: a.user?.email || null,
      timestamp: a.createdAt.toISOString(),
      type: "system" as const,
    }));

    return {
      revenue: {
        value: Math.round(totalRevenue * 100) / 100,
        trend: "up",
      },
      profit: {
        value: Math.round(totalProfit * 100) / 100,
        trend: totalProfit >= 0 ? "up" : "down",
      },
      inventoryValue: {
        value: Math.round(inventoryValue * 100) / 100,
        trend: "flat",
      },
      accountsInStock: {
        value: availableAccounts.length,
        trend: "flat",
      },
      accountsByStatus: statusBreakdown,
      revenueChart: [], // Will be populated with time-series data in production
      topPlatforms: platformBreakdown,
      topSuppliers: supplierBreakdown,
      recentActivity: activityItems,
    };
  }
}
