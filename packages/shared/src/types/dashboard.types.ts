/** Dashboard statistics response */
export interface DashboardStats {
  revenue: DashboardMetric;
  profit: DashboardMetric;
  inventoryValue: DashboardMetric;
  accountsInStock: DashboardMetric;
  accountsByStatus: StatusBreakdown[];
  revenueChart: ChartDataPoint[];
  topPlatforms: PlatformBreakdown[];
  topSuppliers: SupplierBreakdown[];
  recentActivity: RecentActivityItem[];
}

/** Single metric with optional change indicator */
export interface DashboardMetric {
  value: number;
  previousValue?: number;
  changePercent?: number;
  trend?: "up" | "down" | "flat";
}

/** Status breakdown for pie/donut charts */
export interface StatusBreakdown {
  status: string;
  count: number;
  percentage: number;
}

/** Revenue chart data point */
export interface ChartDataPoint {
  date: string;
  revenue: number;
  profit: number;
  sales: number;
}

/** Platform breakdown for bar charts */
export interface PlatformBreakdown {
  platform: string;
  totalAccounts: number;
  available: number;
  sold: number;
  revenue: number;
}

/** Supplier performance breakdown */
export interface SupplierBreakdown {
  supplierId: string;
  supplierName: string;
  totalAccounts: number;
  trustScore: number;
  totalSpent: number;
  totalRevenue: number;
}

/** Recent activity item for the dashboard feed */
export interface RecentActivityItem {
  id: string;
  description: string;
  userEmail: string | null;
  timestamp: string;
  type: "sale" | "purchase" | "reserve" | "status_change" | "system";
}
