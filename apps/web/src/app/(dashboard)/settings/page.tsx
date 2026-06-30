"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  Settings as SettingsIcon,
  Globe,
  MessageSquare,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  Server,
} from "lucide-react";

export default function SettingsPage() {
  const { data: eldoradoStatus } = useQuery({
    queryKey: ["eldorado-status"],
    queryFn: async () => {
      const { data } = await apiClient.get("/eldorado/status");
      return data;
    },
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            System configuration and integrations
          </p>
        </div>
      </div>

      {/* Eldorado API */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            Eldorado.gg API
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Status</p>
            <div className="flex items-center gap-1.5 mt-1">
              {eldoradoStatus?.configured ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Configured</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400">Not Configured</span>
                </>
              )}
            </div>
          </div>
          <div>
            <p className="text-muted-foreground">Base URL</p>
            <p className="text-foreground font-mono text-xs mt-1">
              {eldoradoStatus?.baseUrl || "—"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Authentication</p>
            <div className="flex items-center gap-1.5 mt-1">
              {eldoradoStatus?.authenticated ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Authenticated</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Not Authenticated
                  </span>
                </>
              )}
            </div>
          </div>
          <div>
            <p className="text-muted-foreground">Last Sync</p>
            <p className="text-foreground text-xs mt-1">
              {eldoradoStatus?.lastSync || "Never"}
            </p>
          </div>
        </div>
        <button
          onClick={async () => {
            await apiClient.post("/eldorado/sync");
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 text-sm hover:bg-primary/20 transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          Trigger Sync
        </button>
      </div>

      {/* Discord Bot */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-[#5865F2]" />
          <h2 className="text-lg font-semibold text-foreground">Discord Bot</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Status</p>
            <div className="flex items-center gap-1.5 mt-1">
              <XCircle className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Not Connected</span>
            </div>
            <p className="text-xs text-muted-foreground/50 mt-1">
              Configure DISCORD_BOT_TOKEN in .env
            </p>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Server className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">System</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Version</p>
            <p className="text-foreground mt-1">1.0.0</p>
          </div>
          <div>
            <p className="text-muted-foreground">Environment</p>
            <p className="text-foreground mt-1">Development</p>
          </div>
        </div>
      </div>
    </div>
  );
}
