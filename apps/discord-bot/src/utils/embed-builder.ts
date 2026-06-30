import { EmbedBuilder, ColorResolvable } from "discord.js";
import type { StockSummary, BotStats } from "../services/account.service";

const BRAND_COLOR = 0x3b82f6; // Blue-500
const SUCCESS_COLOR = 0x10b981; // Emerald-500
const ERROR_COLOR = 0xef4444; // Red-500
const INFO_COLOR = 0x06b6d4; // Cyan-500

export function buildStockEmbed(summary: StockSummary): EmbedBuilder {
  const platformList =
    summary.platforms.length > 0
      ? summary.platforms.map((p) => `• **${p.platform}:** ${p.count}`).join("\n")
      : "No accounts yet";

  return new EmbedBuilder()
    .setColor(BRAND_COLOR as ColorResolvable)
    .setTitle("📦 Inventory Stock")
    .setDescription(
      `**Total:** ${summary.total} accounts\n` +
        `🟢 Available: **${summary.available}**\n` +
        `🟡 Reserved: **${summary.reserved}**\n` +
        `🔵 Sold: **${summary.sold}**`
    )
    .addFields({
      name: "By Platform",
      value: platformList,
    })
    .setTimestamp()
    .setFooter({ text: "Eldorado ERP" });
}

export function buildStatsEmbed(stats: BotStats): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(BRAND_COLOR as ColorResolvable)
    .setTitle("📊 Business Statistics")
    .addFields(
      {
        name: "💰 Revenue",
        value: `$${stats.totalRevenue.toLocaleString()}`,
        inline: true,
      },
      {
        name: "📈 Profit",
        value: `$${stats.totalProfit.toLocaleString()}`,
        inline: true,
      },
      {
        name: "📦 Total Accounts",
        value: String(stats.totalAccounts),
        inline: true,
      },
      {
        name: "🟢 Available",
        value: String(stats.availableCount),
        inline: true,
      },
      {
        name: "🔵 Sold",
        value: String(stats.soldCount),
        inline: true,
      }
    )
    .setTimestamp()
    .setFooter({ text: "Eldorado ERP" });
}

export function buildSearchEmbed(
  query: string,
  results: Array<{
    internalId: string;
    platform: string;
    email: string;
    status: string;
    supplier?: { name: string } | null;
  }>
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(INFO_COLOR as ColorResolvable)
    .setTitle(`🔍 Search: "${query}"`)
    .setTimestamp()
    .setFooter({ text: "Eldorado ERP" });

  if (results.length === 0) {
    embed.setDescription("No results found.");
  } else {
    const lines = results.map(
      (r) =>
        `**${r.internalId}** | ${r.platform} | ${r.email}\n` +
        `Status: ${r.status} | Supplier: ${r.supplier?.name || "N/A"}`
    );
    embed.setDescription(lines.join("\n\n").slice(0, 4096));
  }

  return embed;
}

export function buildSuccessEmbed(
  title: string,
  description: string
): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(SUCCESS_COLOR as ColorResolvable)
    .setTitle(`✅ ${title}`)
    .setDescription(description)
    .setTimestamp()
    .setFooter({ text: "Eldorado ERP" });
}

export function buildErrorEmbed(
  title: string,
  description: string
): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(ERROR_COLOR as ColorResolvable)
    .setTitle(`❌ ${title}`)
    .setDescription(description)
    .setTimestamp()
    .setFooter({ text: "Eldorado ERP" });
}

export function buildInfoEmbed(
  title: string,
  description: string
): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(INFO_COLOR as ColorResolvable)
    .setTitle(`ℹ️ ${title}`)
    .setDescription(description)
    .setTimestamp()
    .setFooter({ text: "Eldorado ERP" });
}
