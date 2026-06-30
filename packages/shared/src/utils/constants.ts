/** Default pagination values */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 25,
  MAX_LIMIT: 100,
} as const;

/** Role hierarchy — higher index = more privileges */
export const ROLE_HIERARCHY: Record<string, number> = {
  VIEWER: 0,
  STAFF: 1,
  MANAGER: 2,
  ADMINISTRATOR: 3,
  OWNER: 4,
} as const;

/** Valid account status transitions */
export const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING_VERIFICATION: ["AVAILABLE", "DISABLED", "LOST"],
  WAITING_SUPPLIER: ["PENDING_VERIFICATION", "AVAILABLE", "DISABLED", "LOST"],
  AVAILABLE: ["RESERVED", "SOLD", "DISABLED", "EXPIRED", "LOST"],
  RESERVED: ["AVAILABLE", "SOLD", "DISABLED", "LOST"],
  SOLD: ["REFUNDED"],
  REFUNDED: ["AVAILABLE", "DISABLED"],
  DISABLED: ["AVAILABLE", "PENDING_VERIFICATION"],
  EXPIRED: ["AVAILABLE", "DISABLED", "LOST"],
  LOST: [],
} as const;

/** Supported platforms for categorization */
export const PLATFORMS = [
  "Steam",
  "Epic Games",
  "Origin",
  "Ubisoft Connect",
  "Battle.net",
  "Xbox",
  "PlayStation",
  "Nintendo",
  "Netflix",
  "Spotify",
  "Disney+",
  "HBO Max",
  "Crunchyroll",
  "Amazon Prime",
  "Apple",
  "Google",
  "Twitter/X",
  "Instagram",
  "TikTok",
  "Other",
] as const;

/** Account categories */
export const CATEGORIES = [
  "Gaming",
  "Streaming",
  "Social Media",
  "Productivity",
  "E-Commerce",
  "Education",
  "VPN/Security",
  "Other",
] as const;

/** Status badge colors for the frontend */
export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  AVAILABLE: { bg: "bg-emerald-500/15", text: "text-emerald-400" },
  RESERVED: { bg: "bg-amber-500/15", text: "text-amber-400" },
  SOLD: { bg: "bg-blue-500/15", text: "text-blue-400" },
  REFUNDED: { bg: "bg-purple-500/15", text: "text-purple-400" },
  DISABLED: { bg: "bg-slate-500/15", text: "text-slate-400" },
  EXPIRED: { bg: "bg-red-500/15", text: "text-red-400" },
  PENDING_VERIFICATION: { bg: "bg-orange-500/15", text: "text-orange-400" },
  WAITING_SUPPLIER: { bg: "bg-cyan-500/15", text: "text-cyan-400" },
  LOST: { bg: "bg-rose-500/15", text: "text-rose-400" },
} as const;
