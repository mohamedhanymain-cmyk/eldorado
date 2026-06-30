import * as dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

export const config = {
  token: process.env.DISCORD_BOT_TOKEN || "",
  clientId: process.env.DISCORD_CLIENT_ID || "",
  guildId: process.env.DISCORD_GUILD_ID || "",
  stockChannelIds: (process.env.DISCORD_STOCK_CHANNEL_IDS || "")
    .split(",")
    .filter(Boolean),
};

export function validateConfig(): boolean {
  if (!config.token) {
    console.error("❌ DISCORD_BOT_TOKEN is required");
    return false;
  }
  if (!config.clientId) {
    console.error("❌ DISCORD_CLIENT_ID is required");
    return false;
  }
  return true;
}
