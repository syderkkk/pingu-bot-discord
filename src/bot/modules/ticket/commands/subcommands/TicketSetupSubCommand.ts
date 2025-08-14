import { ActionRow, ActionRowBuilder, ButtonBuilder, ButtonStyle, CategoryChannel, ChannelType, ChatInputCommandInteraction, Guild, Message, MessageFlags, PermissionFlagsBits, TextChannel } from "discord.js";
import { BaseTicketSubCommand } from "./BaseTicketSubCommand";
import { BaseEmbedSchema } from "../../../../../discord/embed/BaseEmbedSchema";
import { embedBuilder } from "../../../../../discord/embed/embedBuilder";


export class TicketSetupSubCommand extends BaseTicketSubCommand {

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {

        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            await interaction.reply({
                content: '❌ Necesitas permisos de administrador para configurar el sistema de tickets.',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const ticketChannel = interaction.options.getChannel('canal', true) as TextChannel;
        const openCategory = interaction.options.getChannel('categoria-abiertos', true) as CategoryChannel;
        const closedCategory = interaction.options.getChannel('categoria-cerrados', true) as CategoryChannel;

        if (!this.validateChannelTypes(ticketChannel, openCategory, closedCategory)) {
            await interaction.reply({
                content: '❌ Los tipos de canales no son válidos. Asegúrate de seleccionar un canal de texto y categorías válidas.',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        if (!this.validateChannelPermissions(interaction.guild!, ticketChannel, openCategory, closedCategory)) {
            await interaction.reply({
                content: '❌ El bot no tiene permisos suficientes en los canales seleccionados.',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            await this.ticketManager.setupTicketSystem(
                interaction.guild!.id,
                ticketChannel.id,
                openCategory.id,
                closedCategory.id
            );

            const embedData = {
                title: "🎫 Sistema de Tickets",
                description: "¡Bienvenido al sistema de tickets!\n\nSelecciona el tipo de ticket que necesitas:",
                color: "3498DB",
                footer: {
                    text: "Puedes tener máximo 2 tickets abiertos"
                }
            };

            const parsed = BaseEmbedSchema.safeParse(embedData);

            if (!parsed.success) {
                throw new Error(`Embed validation failed: ${parsed.error}`);
            }

            const embed = embedBuilder(parsed.data);

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('ticket_create_normal')
                        .setLabel('🎫 Ticket Normal')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('ticket_create_donation')
                        .setLabel('💰 Ticket Donación')
                        .setStyle(ButtonStyle.Success)
                );

            await ticketChannel.send({
                embeds: [embed],
                components: [row]
            });

            await interaction.editReply({
                content: `✅ Sistema de tickets configurado correctamente!\n` +
                    `📍 Canal: ${ticketChannel}\n` +
                    `📂 Tickets abiertos: ${openCategory}\n` +
                    `📁 Tickets cerrados: ${closedCategory}`
            });
        } catch (error) {
            console.error(`[Guild: ${interaction.guild!.id}] Error setting up ticket system:`, error);

            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

            if (interaction.deferred) {
                await interaction.editReply({
                    content: `❌ Error al configurar el sistema de tickets: ${errorMessage}`
                });
            } else {
                await interaction.reply({
                    content: `❌ Error al configurar el sistema de tickets: ${errorMessage}`,
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    }

    private validateChannelTypes(
        ticketChannel: TextChannel,
        openCategory: CategoryChannel,
        closedCategory: CategoryChannel
    ): boolean {
        return (
            ticketChannel.type === ChannelType.GuildText &&
            openCategory.type === ChannelType.GuildCategory &&
            closedCategory.type === ChannelType.GuildCategory
        );
    }

    private validateChannelPermissions(
        guild: Guild | null | undefined,
        ticketChannel: TextChannel,
        openCategory: CategoryChannel,
        closedCategory: CategoryChannel
    ): boolean {
        if (!guild || !guild.members.me) return false;

        const requiredPermissions = [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.ManageRoles
        ];

        return [ticketChannel, openCategory, closedCategory].every(channel =>
            guild.members.me!.permissionsIn(channel).has(requiredPermissions)
        );
    }
}