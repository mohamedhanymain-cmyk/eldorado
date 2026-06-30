"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import {
  ArrowLeft,
  Copy,
  Shield,
  Calendar,
  Tag,
  User,
  Mail,
  Key,
  Globe,
  Truck,
} from "lucide-react";
import type { AccountResponseDto } from "@eldorado/shared";

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

function DetailRow({
  icon: Icon,
  label,
  value,
  copyable = false,
  sensitive = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null;
  copyable?: boolean;
  sensitive?: boolean;
}) {
  const displayValue = value || "—";

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={`text-sm text-foreground mt-0.5 break-all ${sensitive ? "font-mono" : ""}`}
        >
          {displayValue}
        </p>
      </div>
      {copyable && value && (
        <button
          onClick={() => navigator.clipboard.writeText(value)}
          className="p-1 rounded hover:bg-white/[0.06] text-muted-foreground hover:text-foreground transition-colors shrink-0"
          title="Copy"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default function AccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: account, isLoading } = useQuery<AccountResponseDto>({
    queryKey: ["account", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/accounts/${id}`);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-white/[0.06] rounded" />
        <div className="glass-card p-6 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 bg-white/[0.06] rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Account not found
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
          <h1 className="text-2xl font-bold text-foreground font-mono">
            {account.internalId}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {account.platform} • {account.category}
          </p>
        </div>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
            STATUS_BADGE[account.status] || "badge-disabled"
          }`}
        >
          {account.status.replace(/_/g, " ")}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Account Details */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Account Information
          </h2>
          <DetailRow
            icon={Globe}
            label="Platform"
            value={account.platform}
          />
          <DetailRow icon={Tag} label="Category" value={account.category} />
          <DetailRow
            icon={Mail}
            label="Email"
            value={account.email}
            copyable
          />
          <DetailRow
            icon={Key}
            label="Password"
            value={account.password}
            copyable
            sensitive
          />
          <DetailRow
            icon={User}
            label="Username"
            value={account.username}
            copyable
          />
          <DetailRow
            icon={Mail}
            label="Recovery Email"
            value={account.recoveryEmail}
            copyable
          />
          <DetailRow
            icon={Key}
            label="Recovery Password"
            value={account.recoveryPassword}
            copyable
            sensitive
          />
          <DetailRow
            icon={Shield}
            label="2FA Enabled"
            value={account.twoFactorStatus ? "Yes" : "No"}
          />
        </div>

        {/* Financial & Meta */}
        <div className="space-y-4">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Financial Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-secondary/30">
                <p className="text-xs text-muted-foreground">Purchase Price</p>
                <p className="text-xl font-bold text-foreground mt-1">
                  ${account.purchasePrice.toFixed(2)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/30">
                <p className="text-xs text-muted-foreground">
                  Expected Sale Price
                </p>
                <p className="text-xl font-bold text-foreground mt-1">
                  ${account.expectedSalePrice.toFixed(2)}
                </p>
              </div>
              {account.actualSalePrice && (
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 col-span-2">
                  <p className="text-xs text-emerald-400">Actual Sale Price</p>
                  <p className="text-xl font-bold text-emerald-400 mt-1">
                    ${account.actualSalePrice.toFixed(2)}
                  </p>
                  <p className="text-xs text-emerald-400/60 mt-1">
                    Profit: $
                    {(
                      account.actualSalePrice - account.purchasePrice
                    ).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Metadata
            </h2>
            <DetailRow
              icon={Truck}
              label="Supplier"
              value={account.supplierName}
            />
            <DetailRow
              icon={Calendar}
              label="Created"
              value={new Date(account.createdAt).toLocaleString()}
            />
            <DetailRow
              icon={Calendar}
              label="Last Updated"
              value={new Date(account.updatedAt).toLocaleString()}
            />
            <DetailRow
              icon={Tag}
              label="Version"
              value={String(account.version)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
