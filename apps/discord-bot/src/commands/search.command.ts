import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { accountService } from "../services/account.service";
import { buildSearchEmbed } from "../utils/embed-builder";
import type { SlashCommand } from "./index";

export const searchCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search accounts in inventory")
    .addStringOption((opt) =>
      opt.setName("query").setDescription("Search by email, platform, or ID").setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("status")
        .setDescription("Filter by status")
        .setRequired(false)
        .addChoices(
          { name: "Available", value: "AVAILABLE" },
          { name: "Reserved", value: "RESERVED" },
          { name: "Sold", value: "SOLD" },
          { name: "Pending", value: "PENDING_VERIFICATION" }
        )
    ) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const query = interaction.options.getString("query", true);
    const status = interaction.options.getString("status") || undefined;

    const results = await accountService.search(query, status);
    const embed = buildSearchEmbed(query, results);

    await interaction.editReply({ embeds: [embed] });
  },
};
