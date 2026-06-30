import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { accountService } from "../services/account.service";
import { buildSuccessEmbed, buildErrorEmbed } from "../utils/embed-builder";
import type { SlashCommand } from "./index";

export const addCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("add")
    .setDescription("Add an account to inventory")
    .addStringOption((opt) =>
      opt.setName("platform").setDescription("Platform name").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("category").setDescription("Account category").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("email").setDescription("Account email").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("password").setDescription("Account password").setRequired(true)
    )
    .addNumberOption((opt) =>
      opt.setName("purchase_price").setDescription("Purchase price in USD").setRequired(true)
    )
    .addNumberOption((opt) =>
      opt.setName("sale_price").setDescription("Expected sale price in USD").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("supplier").setDescription("Supplier name (optional)").setRequired(false)
    ) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const account = await accountService.createFromBot({
        platform: interaction.options.getString("platform", true),
        category: interaction.options.getString("category", true),
        email: interaction.options.getString("email", true),
        password: interaction.options.getString("password", true),
        purchasePrice: interaction.options.getNumber("purchase_price", true),
        expectedSalePrice: interaction.options.getNumber("sale_price", true),
      });

      await interaction.editReply({
        embeds: [
          buildSuccessEmbed(
            "Account Added",
            `**${account.internalId}** has been added to inventory.\n` +
              `Platform: ${account.platform}\n` +
              `Status: ${account.status}`
          ),
        ],
      });
    } catch (error) {
      await interaction.editReply({
        embeds: [buildErrorEmbed("Failed to Add Account", String(error))],
      });
    }
  },
};
