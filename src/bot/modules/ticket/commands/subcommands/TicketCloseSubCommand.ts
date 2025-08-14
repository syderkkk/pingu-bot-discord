import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { BaseTicketSubCommand } from "./BaseTicketSubCommand";

export class TicketCloseSubCommand extends BaseTicketSubCommand {

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        try {
            await interaction.deferReply({ ephemeral: true });

            const success = await this.ticketManager.closeTicket(
                interaction.guild!,
                interaction.channel!.id,
                interaction.user.id
            );

            if (success) {
                await interaction.editReply({
                    content: '✅ Ticket cerrado exitosamente. El canal se ha movido a la categoría de tickets cerrados.'
                });
            } else {
                await interaction.editReply({
                    content: '❌ No se pudo cerrar el ticket. Verifica que estés en un canal de ticket válido y tengas permisos para cerrarlo.'
                });
            }
        } catch (error) {
            console.error(`[Guild: ${interaction.guild!.id}] Error closing ticket:`, error);

            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

            if (interaction.deferred) {
                await interaction.editReply({
                    content: `❌ Error al cerrar el ticket: ${errorMessage}`
                });
            } else {
                await interaction.reply({
                    content: `❌ Error al cerrar el ticket: ${errorMessage}`,
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    }
}