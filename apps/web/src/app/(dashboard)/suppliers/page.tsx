"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import Link from "next/link";
import {
  Search,
  Star,
  Ban,
  Package,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { SupplierResponseDto, PaginatedResponse } from "@eldorado/shared";

export default function SuppliersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery<PaginatedResponse<SupplierResponseDto>>({
    queryKey: ["suppliers", page, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "12");
      if (search) params.set("search", search);
      const { data } = await apiClient.get(`/suppliers?${params}`);
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Suppliers</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage supplier relationships and performance
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            id="supplier-search"
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search suppliers..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      {/* Supplier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card p-6 animate-pulse space-y-4">
                <div className="h-5 w-32 bg-white/[0.06] rounded" />
                <div className="h-4 w-48 bg-white/[0.06] rounded" />
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="h-16 bg-white/[0.06] rounded-lg" />
                  ))}
                </div>
              </div>
            ))
          : data?.data.map((supplier) => (
              <Link
                key={supplier.id}
                href={`/suppliers/${supplier.id}`}
                className="glass-card p-6 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
              >
                {/* Supplier Header */}
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {supplier.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">
                      {supplier.email || "No email"}
                    </p>
                  </div>
                  {supplier.isBlacklisted && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/20 shrink-0">
                      <Ban className="w-3 h-3" />
                      Blacklisted
                    </span>
                  )}
                </div>

                {/* Trust Score Bar */}
                <div className="mt-4 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Star className="w-3 h-3" /> Trust Score
                    </span>
                    <span
                      className={`font-medium ${
                        supplier.trustScore >= 80
                          ? "text-emerald-400"
                          : supplier.trustScore >= 50
                            ? "text-amber-400"
                            : "text-red-400"
                      }`}
                    >
                      {supplier.trustScore}/100
                    </span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        supplier.trustScore >= 80
                          ? "bg-emerald-500"
                          : supplier.trustScore >= 50
                            ? "bg-amber-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${supplier.trustScore}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Package className="w-3.5 h-3.5" />
                      <span className="text-xs">Accounts</span>
                    </div>
                    <p className="text-lg font-bold text-foreground mt-1">
                      {supplier.accountCount}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span className="text-xs">Balance</span>
                    </div>
                    <p
                      className={`text-lg font-bold mt-1 ${
                        supplier.balance >= 0
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      ${Math.abs(supplier.balance).toFixed(2)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
      </div>

      {/* Empty State */}
      {!isLoading && data?.data.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          No suppliers found
        </div>
      )}

      {/* Pagination */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!data.meta.hasPreviousPage}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.03] disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-muted-foreground">
            {data.meta.page} / {data.meta.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!data.meta.hasNextPage}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.03] disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
