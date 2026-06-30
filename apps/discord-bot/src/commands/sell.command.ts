import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { accountService } from "../services/account.service";
import { buildSuccessEmbed, buildErrorEmbed } from "../utils/embed-builder";
import type { SlashCommand } from "./index";

export const sellCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("sell")
    .setDescription("Mark an account as sold")
    .addStringOption((opt) =>
      opt.setName("internal_id").setDescription("Account internal ID (e.g., ELD-20260630-A1B2C3)").setRequired(true)
    )
    .addNumberOption((opt) =>
      opt.setName("sale_price").setDescription("Actual sale price in USD").setRequired(true)
    ) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const internalId = interaction.options.getString("internal_id", true);
      const salePrice = interaction.options.getNumber("sale_price", true);

      const account = await accountService.sellByInternalId(internalId, salePrice);

      const profit = salePrice - Number(account.purchasePrice);
      await interaction.editReply({
        embeds: [
          buildSuccessEmbed(
            "Account Sold! 💰",
            `**${internalId}** marked as SOLD.\n` +
              `Sale Price: $${salePrice.toFixed(2)}\n` +
              `Profit: $${profit.toFixed(2)}`
          ),
        ],
      });
    } catch (error) {
      await interaction.editReply({
        embeds: [buildErrorEmbed("Failed to Sell", String(error))],
      });
    }
  },
};
