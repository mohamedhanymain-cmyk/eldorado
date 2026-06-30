import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { accountService } from "../services/account.service";
import { buildSuccessEmbed, buildErrorEmbed } from "../utils/embed-builder";
import type { SlashCommand } from "./index";

export const reserveCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("reserve")
    .setDescription("Reserve an account")
    .addStringOption((opt) =>
      opt.setName("internal_id").setDescription("Account internal ID").setRequired(true)
    ) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const internalId = interaction.options.getString("internal_id", true);
      await accountService.reserveByInternalId(internalId);

      await interaction.editReply({
        embeds: [
          buildSuccessEmbed(
            "Account Reserved 🔒",
            `**${internalId}** has been reserved.`
          ),
        ],
      });
    } catch (error) {
      await interaction.editReply({
        embeds: [buildErrorEmbed("Failed to Reserve", String(error))],
      });
    }
  },
};
