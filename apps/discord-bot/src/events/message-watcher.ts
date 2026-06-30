import { Message } from "discord.js";
import { config } from "../config";
import { parseMessage } from "../utils/message-parser";
import { accountService } from "../services/account.service";

/**
 * Watches configured stock channels for supplier messages.
 * Parses messages using templates and auto-inserts accounts into inventory.
 */
export async function handleMessageCreate(message: Message) {
  // Ignore bots
  if (message.author.bot) return;

  // Only process messages from configured stock channels
  if (
    config.stockChannelIds.length === 0 ||
    !config.stockChannelIds.includes(message.channelId)
  ) {
    return;
  }

  const content = message.content.trim();
  if (!content) return;

  // Parse the message for account data
  const parsedAccounts = parseMessage(content);

  if (parsedAccounts.length === 0) return;

  console.log(
    `📨 Parsed ${parsedAccounts.length} account(s) from stock channel message`
  );

  let successCount = 0;
  let failCount = 0;

  for (const parsed of parsedAccounts) {
    try {
      await accountService.createFromBot({
        platform: parsed.platform || "Unknown",
        category: parsed.category || "Other",
        email: parsed.email,
        password: parsed.password,
        purchasePrice: parsed.price || 0,
        expectedSalePrice: parsed.price ? parsed.price * 2 : 0,
      });
      successCount++;
    } catch (error) {
      console.error(`Failed to auto-insert account: ${error}`);
      failCount++;
    }
  }

  // React to the message to indicate processing
  try {
    if (successCount > 0) {
      await message.react("✅");
    }
    if (failCount > 0) {
      await message.react("⚠️");
    }
  } catch {
    // Ignore react failures (missing permissions, etc.)
  }

  console.log(
    `   ✅ Inserted: ${successCount}, ❌ Failed: ${failCount}`
  );
}
