import { Guild, PermissionFlagsBits, TextChannel } from "discord.js";
import { TicketSettings } from "./models/TicketSettings";
import { TicketService } from "./services/TicketService";
import { TicketChannel } from "./models/TicketChannel";
import { TicketType } from "./types/TicketType";

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

    public async createManualTicket(
        guild: Guild,
        userId: string,
        type: TicketType
    ): Promise<TicketChannel | null> {
        try {
            const settings = this.getSettings(guild.id);
            if (!settings) {
                throw new Error('Sistema de tickets no configurado para este servidor');
            }

            if (!this.ticketService.canUserCreateTicket(guild, userId)) {
                throw new Error('El usuario ya tiene el máximo de tickets permitidos (2)');
            }

            const ticketChannel = await this.ticketService.createTicketChannel(guild, userId, type);

            if (ticketChannel) {
                console.log(`[Guild: ${guild.id}] Manual ticket created for user ${userId} by admin`);
            }

            return ticketChannel;
        } catch (error) {
            console.error(`[Guild: ${guild.id}] Error in TicketManager.createManualTicket:`, error);
            throw error;
        }
    }

    public async closeTicket(guild: Guild, channelId: string, userId: string): Promise<boolean> {
        try {
            const channel = guild.channels.cache.get(channelId) as TextChannel;
            if (!channel) {
                console.warn(`[Guild: ${guild.id}] Channel ${channelId} not found`);
                return false;
            }

            const ticketChannel = TicketChannel.fromChannelName(channel.name, guild.id);
            if (!ticketChannel) {
                console.warn(`[Guild: ${guild.id}] Channel ${channelId} is not a valid ticket channel`);
                return false;
            }

            const member = await guild.members.fetch(userId);
            const canClose = ticketChannel.isOwnedBy(userId) ||
                member.permissions.has(PermissionFlagsBits.ManageChannels);

            if (!canClose) {
                console.warn(`[Guild: ${guild.id}] User ${userId} doesn't have permission to close ticket ${channelId}`);
                return false;
            }

            const success = await this.ticketService.moveTicketToClosedCategory(guild, channelId);
            if (success) {
                ticketChannel.close();
                console.log(`[Guild: ${guild.id}] Ticket ${channelId} closed successfully by user ${userId}`);
            }

            return success;
        } catch (error) {
            console.error(`[Guild: ${guild.id}] Error closing ticket ${channelId}:`, error);
            return false;
        }
    }

}