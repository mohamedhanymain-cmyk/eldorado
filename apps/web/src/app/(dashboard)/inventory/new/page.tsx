"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { PLATFORMS, CATEGORIES } from "@eldorado/shared";
import type { SupplierResponseDto, PaginatedResponse } from "@eldorado/shared";

export default function NewAccountPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    platform: "",
    category: "",
    email: "",
    password: "",
    recoveryEmail: "",
    recoveryPassword: "",
    username: "",
    twoFactorStatus: false,
    purchasePrice: "",
    expectedSalePrice: "",
    supplierId: "",
  });

  const { data: suppliers } = useQuery<PaginatedResponse<SupplierResponseDto>>({
    queryKey: ["suppliers-select"],
    queryFn: async () => {
      const { data } = await apiClient.get("/suppliers?limit=100");
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (formData: typeof form) => {
      const { data } = await apiClient.post("/accounts", {
        ...formData,
        purchasePrice: parseFloat(formData.purchasePrice),
        expectedSalePrice: parseFloat(formData.expectedSalePrice),
        supplierId: formData.supplierId || undefined,
        recoveryEmail: formData.recoveryEmail || undefined,
        recoveryPassword: formData.recoveryPassword || undefined,
        username: formData.username || undefined,
      });
      return data;
    },
    onSuccess: () => {
      router.push("/inventory");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  const updateField = (
    field: string,
    value: string | boolean
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-white/[0.03] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Add New Account
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Add a digital account to your inventory
          </p>
        </div>
      </div>

      {/* Error */}
      {createMutation.isError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
          {(createMutation.error as Error).message || "Failed to create account"}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
        {/* Platform & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="new-acc-platform" className="text-sm font-medium text-muted-foreground">
              Platform *
            </label>
            <select
              id="new-acc-platform"
              required
              value={form.platform}
              onChange={(e) => updateField("platform", e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            >
              <option value="">Select platform</option>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="new-acc-category" className="text-sm font-medium text-muted-foreground">
              Category *
            </label>
            <select
              id="new-acc-category"
              required
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Credentials */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="new-acc-email" className="text-sm font-medium text-muted-foreground">
              Email *
            </label>
            <input
              id="new-acc-email"
              type="email"
              required
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="new-acc-password" className="text-sm font-medium text-muted-foreground">
              Password *
            </label>
            <input
              id="new-acc-password"
              type="text"
              required
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        {/* Recovery & Username */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label htmlFor="new-acc-username" className="text-sm font-medium text-muted-foreground">
              Username
            </label>
            <input
              id="new-acc-username"
              type="text"
              value={form.username}
              onChange={(e) => updateField("username", e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="new-acc-recovery-email" className="text-sm font-medium text-muted-foreground">
              Recovery Email
            </label>
            <input
              id="new-acc-recovery-email"
              type="email"
              value={form.recoveryEmail}
              onChange={(e) => updateField("recoveryEmail", e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="new-acc-recovery-pass" className="text-sm font-medium text-muted-foreground">
              Recovery Password
            </label>
            <input
              id="new-acc-recovery-pass"
              type="text"
              value={form.recoveryPassword}
              onChange={(e) => updateField("recoveryPassword", e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        {/* Pricing & Supplier */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label htmlFor="new-acc-purchase" className="text-sm font-medium text-muted-foreground">
              Purchase Price ($) *
            </label>
            <input
              id="new-acc-purchase"
              type="number"
              step="0.01"
              min="0"
              required
              value={form.purchasePrice}
              onChange={(e) => updateField("purchasePrice", e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="new-acc-sale" className="text-sm font-medium text-muted-foreground">
              Expected Sale Price ($) *
            </label>
            <input
              id="new-acc-sale"
              type="number"
              step="0.01"
              min="0"
              required
              value={form.expectedSalePrice}
              onChange={(e) => updateField("expectedSalePrice", e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="new-acc-supplier" className="text-sm font-medium text-muted-foreground">
              Supplier
            </label>
            <select
              id="new-acc-supplier"
              value={form.supplierId}
              onChange={(e) => updateField("supplierId", e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            >
              <option value="">No supplier</option>
              {suppliers?.data.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2FA Toggle */}
        <div className="flex items-center gap-3">
          <input
            id="new-acc-2fa"
            type="checkbox"
            checked={form.twoFactorStatus}
            onChange={(e) => updateField("twoFactorStatus", e.target.checked)}
            className="w-4 h-4 rounded border-border bg-secondary/50 text-primary focus:ring-primary/50"
          />
          <label htmlFor="new-acc-2fa" className="text-sm text-muted-foreground">
            Two-Factor Authentication enabled on this account
          </label>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Create Account
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
