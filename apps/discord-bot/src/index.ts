import {
  Client,
  GatewayIntentBits,
  Collection,
  Events,
} from "discord.js";
import { config, validateConfig } from "./config";
import { loadCommands } from "./commands/index";
import { handleMessageCreate } from "./events/message-watcher";
import { handleReady } from "./events/ready";
import type { SlashCommand } from "./commands/index";

// Extend Client to hold commands
declare module "discord.js" {
  interface Client {
    commands: Collection<string, SlashCommand>;
  }
}

async function main() {
  console.log("🤖 Starting Eldorado Discord Bot...\n");

  if (!validateConfig()) {
    console.log("\n⚠️  Bot cannot start without valid configuration.");
    console.log("   Set DISCORD_BOT_TOKEN and DISCORD_CLIENT_ID in .env");
    process.exit(1);
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  // Load commands
  client.commands = new Collection();
  const commands = loadCommands();
  for (const cmd of commands) {
    client.commands.set(cmd.data.name, cmd);
  }

  // Ready event
  client.once(Events.ClientReady, (readyClient) => {
    handleReady(readyClient);
  });

  // Slash command handler
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Error executing command ${interaction.commandName}:`, error);
      const reply = {
        content: "❌ An error occurred while executing this command.",
        ephemeral: true,
      };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    }
  });

  // Message watcher for stock channels
  client.on(Events.MessageCreate, (message) => {
    handleMessageCreate(message);
  });

  // Login
  await client.login(config.token);
}

main().catch((error) => {
  console.error("❌ Failed to start bot:", error);
  process.exit(1);
});
