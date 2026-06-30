"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { ScrollText, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import type { AuditLogResponseDto, PaginatedResponse } from "@eldorado/shared";

export default function AuditPage() {
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [entityFilter, setEntityFilter] = useState("");

  const { data, isLoading } = useQuery<PaginatedResponse<AuditLogResponseDto>>({
    queryKey: ["audit-logs", page, entityFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      if (entityFilter) params.set("entity", entityFilter);
      const { data } = await apiClient.get(`/audit/logs?${params}`);
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ScrollText className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Track every change in the system
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex gap-3">
        <select
          id="audit-entity-filter"
          value={entityFilter}
          onChange={(e) => {
            setEntityFilter(e.target.value);
            setPage(1);
          }}
          className="h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        >
          <option value="">All Entities</option>
          <option value="Account">Account</option>
          <option value="Supplier">Supplier</option>
          <option value="User">User</option>
          <option value="System">System</option>
        </select>
      </div>

      {/* Logs */}
      <div className="glass-card divide-y divide-border">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-4 animate-pulse">
              <div className="h-4 w-64 bg-white/[0.06] rounded" />
              <div className="h-3 w-40 bg-white/[0.06] rounded mt-2" />
            </div>
          ))
        ) : data?.data && data.data.length > 0 ? (
          data.data.map((log) => (
            <div key={log.id} className="group">
              <button
                onClick={() =>
                  setExpandedId(expandedId === log.id ? null : log.id)
                }
                className="w-full p-4 flex items-start gap-4 text-left hover:bg-white/[0.02] transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">
                      {log.action}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {log.entity}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      by {log.userEmail}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                    {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                  </div>
                </div>
                {(log.oldValue || log.newValue) && (
                  expandedId === log.id ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                  )
                )}
              </button>

              {/* Expanded details */}
              {expandedId === log.id && (log.oldValue || log.newValue) && (
                <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {log.oldValue && (
                    <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                      <p className="text-xs font-medium text-red-400 mb-2">
                        Old Value
                      </p>
                      <pre className="text-xs text-muted-foreground overflow-x-auto custom-scrollbar whitespace-pre-wrap">
                        {JSON.stringify(log.oldValue, null, 2)}
                      </pre>
                    </div>
                  )}
                  {log.newValue && (
                    <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                      <p className="text-xs font-medium text-emerald-400 mb-2">
                        New Value
                      </p>
                      <pre className="text-xs text-muted-foreground overflow-x-auto custom-scrollbar whitespace-pre-wrap">
                        {JSON.stringify(log.newValue, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-muted-foreground text-sm">
            No audit logs found
          </div>
        )}
      </div>

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
