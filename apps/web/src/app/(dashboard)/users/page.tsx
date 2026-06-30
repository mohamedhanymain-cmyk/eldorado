"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Users, Shield, UserCheck, UserX } from "lucide-react";
import type { UserResponseDto, PaginatedResponse } from "@eldorado/shared";

const ROLE_COLORS: Record<string, string> = {
  OWNER: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  ADMINISTRATOR: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  MANAGER: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  STAFF: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  VIEWER: "bg-slate-500/15 text-slate-400 border-slate-500/20",
};

export default function UsersPage() {
  const { data, isLoading } = useQuery<PaginatedResponse<UserResponseDto>>({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await apiClient.get("/users?limit=50");
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            User Management
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage system users and roles
          </p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                User
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                Role
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                Status
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-white/[0.06] rounded w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              : data?.data.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-sm font-semibold text-primary">
                          {user.email.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-foreground">
                          {user.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${ROLE_COLORS[user.role] || ""}`}
                      >
                        <Shield className="w-3 h-3" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1 text-sm text-emerald-400">
                          <UserCheck className="w-4 h-4" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-sm text-red-400">
                          <UserX className="w-4 h-4" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
