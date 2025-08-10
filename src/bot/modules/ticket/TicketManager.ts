import { Guild } from "discord.js";
import { TicketSettings } from "./models/TicketSettings";
import { TicketService } from "./services/TicketService";

export class TicketManager {
    private ticketService: TicketService;

    constructor() {
        this.ticketService = new TicketService();
    }

    public async setupTicketSystem(
        guildId: string,
        ticketChannelId: string,
        openCategoryId: string,
        closedCategoryId: string
    ): Promise<void> {
        try {
            const settings = new TicketSettings(guildId, ticketChannelId, openCategoryId, closedCategoryId);
            this.ticketService.setSettings(guildId, settings);

            console.log(`Ticket system set up for guild ${guildId}: `, {
                ticketChannelId,
                openCategoryId,
                closedCategoryId
            });
        } catch (error) {
            console.error(`[Guild: ${guildId}] Error setting up ticket system:`, error);
            throw new Error('Failed to setup ticket system');
        }

    }

    public getSettings(guildId: string): TicketSettings | undefined {
        return this.ticketService.getSettings(guildId);
    }

    public getTicketService(): TicketService {
        return this.ticketService;
    }

    public async validateSystemConfiguration(guild: Guild): Promise<boolean> {
        const settings = this.getSettings(guild.id);
        if (!settings) return false;

        try {
            const ticketChannel = guild.channels.cache.get(settings.ticketChannelId);
            const openCategory = guild.channels.cache.get(settings.openCategoryId);
            const closedCategory = guild.channels.cache.get(settings.closedCategoryId);

            return !!(ticketChannel && openCategory && closedCategory);
        } catch {
            return false;
        }
    }

}