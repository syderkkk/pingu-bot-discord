import { Interaction } from "discord.js";
import { CommandManager } from "../core/CommandManager";
import { TicketManager } from "../modules/ticket/TicketManager";


export async function onInteractionCreate(
    interaction: Interaction,
    commandManager: CommandManager,
    ticketManager: TicketManager
): Promise<void> {
    try {
        if (interaction.isChatInputCommand()) {
            console.log(`[onInteractionCreate] Handling command: ${interaction.commandName}`);
            const command = commandManager.getCommand(interaction.commandName);
            if (!command) return;

            await command.execute(interaction);
        }
        else if (interaction.isButton()) {
            console.log(`[onInteractionCreate] Handling button: ${interaction.customId}`);
            let handled = false;

            handled = await ticketManager.handleButtonInteraction(interaction);

            if (!handled) {
                console.warn(`[Guild: ${interaction.guild?.id}] Unhandled button interaction: ${interaction.customId}`);
            }

        }
    } catch (error) {
        console.error(`[Guild: ${interaction.guild?.id}] Error handling interaction:`, error);

        if (interaction.isRepliable()) {
            const reply = {
                content: 'Hubo un error al ejecutar este comando.',
                ephemeral: true
            };
            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(reply);
                } else {
                    await interaction.reply(reply);
                }
            } catch (replyError) {
                console.error(`[Guild: ${interaction.guild?.id}] Error sending error reply:`, replyError);
            }
        }
    }
}