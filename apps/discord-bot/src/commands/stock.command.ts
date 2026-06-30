import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { accountService } from "../services/account.service";
import { buildStockEmbed } from "../utils/embed-builder";
import type { SlashCommand } from "./index";

export const stockCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("stock")
    .setDescription("View current inventory stock summary")
    .addStringOption((opt) =>
      opt.setName("platform").setDescription("Filter by platform").setRequired(false)
    ) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const platform = interaction.options.getString("platform") || undefined;
    const summary = await accountService.getStockSummary(platform);
    const embed = buildStockEmbed(summary);

    await interaction.editReply({ embeds: [embed] });
  },
};
