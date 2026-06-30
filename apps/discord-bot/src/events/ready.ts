import { Client } from "discord.js";

export function handleReady(client: Client<true>) {
  console.log(`\n🤖 Eldorado Bot is online as: ${client.user.tag}`);
  console.log(`   Serving ${client.guilds.cache.size} guild(s)\n`);

  // Set presence
  client.user.setPresence({
    activities: [
      {
        name: "inventory | /stock",
        type: 3, // WATCHING
      },
    ],
    status: "online",
  });
}
