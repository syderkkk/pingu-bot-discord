import { ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";
import { BaseTicketSubCommand } from "./BaseTicketSubCommand";
import { TicketType } from "../../types/TicketType";


export class TicketOpenSubCommand extends BaseTicketSubCommand {
    
    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)) {
            await interaction.reply({
                content: '❌ Necesitas permisos para gestionar canales para crear tickets manualmente.',
                ephemeral: true
            });
            return;
        }

        const targetUser = interaction.options.getUser('usuario', true);
        const ticketType = interaction.options.getString('tipo', true) as TicketType;

        try {
            await interaction.guild!.members.fetch(targetUser.id);
        } catch {
            await interaction.reply({
                content: '❌ El usuario especificado no está en este servidor.',
                ephemeral: true
            });
            return;
        }

        try {
            await interaction.deferReply({ ephemeral: true });

            const ticketChannel = await this.ticketManager.createManualTicket(
                interaction.guild!,
                targetUser.id,
                ticketType
            );

            if (ticketChannel) {
                await interaction.editReply({
                    content: `✅ Ticket creado exitosamente para ${targetUser.username}: <#${ticketChannel.channelId}>`
                });
            } else {
                await interaction.editReply({
                    content: '❌ No se pudo crear el ticket. Verifica la configuración del sistema.'
                });
            }
        } catch (error) {
            console.error(`[Guild: ${interaction.guild!.id}] Error creating manual ticket:`, error);
            
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            
            if (interaction.deferred) {
                await interaction.editReply({
                    content: `❌ Error al crear el ticket: ${errorMessage}`
                });
            } else {
                await interaction.reply({
                    content: `❌ Error al crear el ticket: ${errorMessage}`,
                    ephemeral: true
                });
            }
        }
    }
}