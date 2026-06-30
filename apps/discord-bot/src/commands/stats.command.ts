import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { accountService } from "../services/account.service";
import { buildStatsEmbed } from "../utils/embed-builder";
import type { SlashCommand } from "./index";

export const statsCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("View business statistics summary") as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const stats = await accountService.getStats();
    const embed = buildStatsEmbed(stats);

    await interaction.editReply({ embeds: [embed] });
  },
};
