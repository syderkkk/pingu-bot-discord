import { ChatInputCommandInteraction } from "discord.js";
import { TicketManager } from "../../TicketManager";


export abstract class BaseTicketSubCommand {
    protected ticketManager: TicketManager;

    constructor(ticketManager: TicketManager) {
        this.ticketManager = ticketManager;
    }

    public abstract execute(interaction: ChatInputCommandInteraction): Promise<void>;
}