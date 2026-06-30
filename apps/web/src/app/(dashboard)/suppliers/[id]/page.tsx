"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import {
  ArrowLeft,
  Star,
  Ban,
  Package,
  DollarSign,
  Mail,
  FileText,
} from "lucide-react";
import type { SupplierResponseDto } from "@eldorado/shared";

export default function SupplierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: supplier, isLoading } = useQuery<SupplierResponseDto>({
    queryKey: ["supplier", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/suppliers/${id}`);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-white/[0.06] rounded" />
        <div className="glass-card p-6 h-48 bg-white/[0.06]" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Supplier not found
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-white/[0.03] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            {supplier.name}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Supplier profile
          </p>
        </div>
        {supplier.isBlacklisted && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-red-500/15 text-red-400 border border-red-500/20">
            <Ban className="w-4 h-4" />
            Blacklisted
          </span>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card p-5 text-center">
          <Star className="w-5 h-5 text-amber-400 mx-auto" />
          <p className="text-2xl font-bold text-foreground mt-2">
            {supplier.trustScore}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Trust Score</p>
        </div>
        <div className="glass-card p-5 text-center">
          <Package className="w-5 h-5 text-primary mx-auto" />
          <p className="text-2xl font-bold text-foreground mt-2">
            {supplier.accountCount}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Total Accounts</p>
        </div>
        <div className="glass-card p-5 text-center">
          <DollarSign className="w-5 h-5 text-emerald-400 mx-auto" />
          <p
            className={`text-2xl font-bold mt-2 ${supplier.balance >= 0 ? "text-emerald-400" : "text-red-400"}`}
          >
            ${Math.abs(supplier.balance).toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Balance</p>
        </div>
        <div className="glass-card p-5 text-center">
          <Mail className="w-5 h-5 text-cyan-400 mx-auto" />
          <p className="text-sm font-medium text-foreground mt-2 truncate">
            {supplier.email || "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Contact</p>
        </div>
      </div>

      {/* Notes */}
      {supplier.notes && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">Notes</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {supplier.notes}
          </p>
        </div>
      )}

      {/* Metadata */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Details
        </h2>
        <div className="grid grid-cols-2 gap-y-3 text-sm">
          <span className="text-muted-foreground">Created</span>
          <span className="text-foreground">
            {new Date(supplier.createdAt).toLocaleString()}
          </span>
          <span className="text-muted-foreground">Last Updated</span>
          <span className="text-foreground">
            {new Date(supplier.updatedAt).toLocaleString()}
          </span>
          <span className="text-muted-foreground">Supplier ID</span>
          <span className="text-foreground font-mono text-xs">
            {supplier.id}
          </span>
        </div>
      </div>
    </div>
  );
}
