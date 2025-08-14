import { ButtonInteraction, MessageFlags } from "discord.js";
import { TicketManager } from "../TicketManager";
import { TicketType } from "../types/TicketType";


export class TicketButtonHandler {
    constructor(private ticketManager: TicketManager) { }

    public async handleButtonInteraction(interaction: ButtonInteraction): Promise<boolean> {

        if (!interaction.customId.startsWith("ticket_create_")) {
            return false;
        }

        if (!interaction.guild) {
            await interaction.reply({
                content: '❌ Este comando solo puede ser usado en un servidor.',
                flags: MessageFlags.Ephemeral
            });
            return true;
        }

        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const ticketType = interaction.customId.replace('ticket_create_', '') as TicketType;

            if (!this.ticketManager.getTicketService().canUserCreateTicket(interaction.guild, interaction.user.id)) {
                await interaction.editReply({
                    content: '❌ Ya tienes el máximo de tickets permitidos (2). Cierra algunos tickets antes de crear uno nuevo.'
                });
                return true;
            }

            const ticketChannel = await this.ticketManager.getTicketService().createTicketChannel(
                interaction.guild,
                interaction.user.id,
                ticketType
            );

            if (ticketChannel) {
                await interaction.editReply({
                    content: `✅ Ticket creado exitosamente: <#${ticketChannel.channelId}>\n\nPuedes encontrarlo en la categoría de tickets abiertos.`
                });

                const channel = interaction.guild.channels.cache.get(ticketChannel.channelId);
                if (channel && channel.isTextBased()) {
                    await channel.send({
                        content: `¡Hola <@${interaction.user.id}>! 👋\n\n` +
                            `Este es tu ticket de tipo **${ticketType}**.\n` +
                            `Un miembro del staff te ayudará pronto.\n\n` +
                            `Para cerrar este ticket, puedes usar el comando \`/ticket close\` o contactar a un administrador.`
                    });
                }

                console.log(`[Guild: ${interaction.guild.id}] Ticket created via button by user ${interaction.user.id} (type: ${ticketType})`);
            } else {
                await interaction.editReply({
                    content: '❌ No se pudo crear el ticket. Por favor, contacta a un administrador.'
                });
            }
            return true;
        } catch (error) {
            console.error(`[Guild: ${interaction.guild.id}] Error handling ticket button interaction:`, error);

            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

            if (interaction.deferred) {
                await interaction.editReply({
                    content: `❌ Error al crear el ticket: ${errorMessage}`
                });
            } else {
                await interaction.reply({
                    content: `❌ Error al crear el ticket: ${errorMessage}`,
                    flags: MessageFlags.Ephemeral
                });
            }
            return true;
        }
    }
}