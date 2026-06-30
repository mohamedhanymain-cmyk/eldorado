"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  ShoppingCart,
  BookmarkPlus,
  Loader2,
} from "lucide-react";
import type { AccountResponseDto, PaginatedResponse } from "@eldorado/shared";

const STATUS_BADGE: Record<string, string> = {
  AVAILABLE: "badge-available",
  RESERVED: "badge-reserved",
  SOLD: "badge-sold",
  REFUNDED: "badge-refunded",
  DISABLED: "badge-disabled",
  EXPIRED: "badge-expired",
  PENDING_VERIFICATION: "badge-pending",
  WAITING_SUPPLIER: "badge-waiting",
  LOST: "badge-lost",
};

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading } = useQuery<PaginatedResponse<AccountResponseDto>>({
    queryKey: ["accounts", page, search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "15");
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const { data } = await apiClient.get(`/accounts?${params}`);
      return data;
    },
  });

  const reserveMutation = useMutation({
    mutationFn: async ({
      id,
      version,
    }: {
      id: string;
      version: number;
    }) => {
      const { data } = await apiClient.post(`/accounts/${id}/reserve`, {
        version,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  const sellMutation = useMutation({
    mutationFn: async ({
      id,
      version,
      actualSalePrice,
    }: {
      id: string;
      version: number;
      actualSalePrice: number;
    }) => {
      const { data } = await apiClient.post(`/accounts/${id}/sell`, {
        version,
        actualSalePrice,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  const statuses = [
    "",
    "AVAILABLE",
    "RESERVED",
    "SOLD",
    "PENDING_VERIFICATION",
    "DISABLED",
    "EXPIRED",
    "REFUNDED",
    "LOST",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your digital account inventory
          </p>
        </div>
        <Link
          href="/inventory/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Account
        </Link>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="inventory-search"
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by ID, email, platform..."
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              id="inventory-status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 pl-10 pr-8 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer transition-all"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s || "All Statuses"}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Internal ID
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Platform
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Email
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Status
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Purchase
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Sale Price
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Supplier
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-white/[0.06] rounded w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data?.data && data.data.length > 0 ? (
                data.data.map((account) => (
                  <tr
                    key={account.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/inventory/${account.id}`}
                        className="text-sm font-mono text-primary hover:underline"
                      >
                        {account.internalId}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {account.platform}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground truncate max-w-[200px]">
                      {account.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          STATUS_BADGE[account.status] || "badge-disabled"
                        }`}
                      >
                        {account.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-muted-foreground">
                      ${account.purchasePrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-foreground font-medium">
                      ${account.expectedSalePrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {account.supplierName || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/inventory/${account.id}`}
                          className="p-1.5 rounded-md hover:bg-white/[0.06] text-muted-foreground hover:text-foreground transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {account.status === "AVAILABLE" && (
                          <>
                            <button
                              onClick={() =>
                                reserveMutation.mutate({
                                  id: account.id,
                                  version: account.version,
                                })
                              }
                              className="p-1.5 rounded-md hover:bg-amber-500/10 text-muted-foreground hover:text-amber-400 transition-colors"
                              title="Reserve"
                            >
                              <BookmarkPlus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const price = prompt(
                                  "Enter sale price:",
                                  String(account.expectedSalePrice)
                                );
                                if (price) {
                                  sellMutation.mutate({
                                    id: account.id,
                                    version: account.version,
                                    actualSalePrice: parseFloat(price),
                                  });
                                }
                              }}
                              className="p-1.5 rounded-md hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400 transition-colors"
                              title="Sell"
                            >
                              <ShoppingCart className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                  >
                    No accounts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.meta && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Showing {(data.meta.page - 1) * data.meta.limit + 1}–
              {Math.min(data.meta.page * data.meta.limit, data.meta.total)} of{" "}
              {data.meta.total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!data.meta.hasPreviousPage}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/[0.03] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-muted-foreground px-2">
                {data.meta.page} / {data.meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.meta.hasNextPage}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/[0.03] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mutation loading indicator */}
      {(reserveMutation.isPending || sellMutation.isPending) && (
        <div className="fixed bottom-6 right-6 glass-card px-4 py-3 flex items-center gap-2 animate-slide-in-right">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm text-foreground">Processing...</span>
        </div>
      )}
    </div>
  );
}
