import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  REST,
  Routes,
} from "discord.js";
import { config } from "../config";
import { stockCommand } from "./stock.command";
import { addCommand } from "./add.command";
import { sellCommand } from "./sell.command";
import { reserveCommand } from "./reserve.command";
import { searchCommand } from "./search.command";
import { statsCommand } from "./stats.command";
import { supplierCommand } from "./supplier.command";

export interface SlashCommand {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export function loadCommands(): SlashCommand[] {
  return [
    stockCommand,
    addCommand,
    sellCommand,
    reserveCommand,
    searchCommand,
    statsCommand,
    supplierCommand,
  ];
}

/**
 * Deploy slash commands to Discord.
 * Run with: pnpm run deploy-commands
 */
export async function deployCommands() {
  const commands = loadCommands().map((cmd) => cmd.data.toJSON());
  const rest = new REST().setToken(config.token);

  try {
    console.log(`Deploying ${commands.length} slash commands...`);

    if (config.guildId) {
      // Guild-specific (instant, good for development)
      await rest.put(
        Routes.applicationGuildCommands(config.clientId, config.guildId),
        { body: commands }
      );
      console.log(`✅ Deployed to guild: ${config.guildId}`);
    } else {
      // Global (takes up to 1 hour to propagate)
      await rest.put(Routes.applicationCommands(config.clientId), {
        body: commands,
      });
      console.log("✅ Deployed globally");
    }
  } catch (error) {
    console.error("❌ Failed to deploy commands:", error);
  }
}
