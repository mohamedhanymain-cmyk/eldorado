import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { prisma } from "@eldorado/database";
import { buildInfoEmbed, buildErrorEmbed } from "../utils/embed-builder";
import type { SlashCommand } from "./index";

export const supplierCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("supplier")
    .setDescription("View supplier information")
    .addStringOption((opt) =>
      opt.setName("name").setDescription("Supplier name to look up").setRequired(true)
    ) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const name = interaction.options.getString("name", true);

    try {
      const supplier = await prisma.supplier.findFirst({
        where: { name: { contains: name, mode: "insensitive" } },
        include: { _count: { select: { accounts: true } } },
      });

      if (!supplier) {
        await interaction.editReply({
          embeds: [buildErrorEmbed("Not Found", `No supplier matching "${name}"`)],
        });
        return;
      }

      await interaction.editReply({
        embeds: [
          buildInfoEmbed("Supplier Info", [
            `**Name:** ${supplier.name}`,
            `**Email:** ${supplier.email || "N/A"}`,
            `**Trust Score:** ${supplier.trustScore}/100`,
            `**Blacklisted:** ${supplier.isBlacklisted ? "⚠️ Yes" : "No"}`,
            `**Balance:** $${Number(supplier.balance).toFixed(2)}`,
            `**Accounts:** ${supplier._count.accounts}`,
            supplier.notes ? `\n**Notes:** ${supplier.notes}` : "",
          ].join("\n")),
        ],
      });
    } catch (error) {
      await interaction.editReply({
        embeds: [buildErrorEmbed("Error", String(error))],
      });
    }
  },
};
