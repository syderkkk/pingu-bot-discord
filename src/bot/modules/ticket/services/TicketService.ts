import { Guild, CategoryChannel, TextChannel, PermissionFlagsBits, ChannelType } from "discord.js";
import { TicketSettings } from "../models/TicketSettings";
import { TicketChannel } from "../models/TicketChannel";
import { TicketType } from "../types/TicketType";
import { TicketStatus } from "../types/TicketStatus";

export class TicketService {
    private static globalSettings: Map<string, TicketSettings> = new Map();

    public setSettings(guildId: string, settings: TicketSettings): void {
        TicketService.globalSettings.set(guildId, settings);
        console.log(`[TicketService] Settings saved for guild ${guildId}:`, {
            ticketChannelId: settings.ticketChannelId,
            openCategoryId: settings.openCategoryId,
            closedCategoryId: settings.closedCategoryId
        });
    }

    public getSettings(guildId: string): TicketSettings | undefined {
        const settings = TicketService.globalSettings.get(guildId);
        console.log(`[TicketService] Getting settings for guild ${guildId}:`, settings ? 'Found' : 'Not found');
        return settings;
    }

    public async createTicketChannel(
        guild: Guild,
        userId: string,
        type: TicketType
    ): Promise<TicketChannel | null> {
        const settings = this.getSettings(guild.id);
        if (!settings) {
            throw new Error('Ticket system not configured for this guild');
        }

        const openCategory = guild.channels.cache.get(settings.openCategoryId) as CategoryChannel;
        if (!openCategory) {
            throw new Error('Open category not found');
        }

        const user = await guild.members.fetch(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const adminRoles = guild.roles.cache.filter(role =>
            role.permissions.has(PermissionFlagsBits.Administrator) ||
            role.permissions.has(PermissionFlagsBits.ManageChannels)
        );

        const ticketChannel = new TicketChannel({
            channelId: '',
            userId,
            guildId: guild.id,
            type,
            status: TicketStatus.OPEN,
            createdAt: new Date()
        });

        const channel = await guild.channels.create({
            name: ticketChannel.generateChannelName(),
            type: ChannelType.GuildText,
            parent: openCategory,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: userId,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                },
                ...adminRoles.map(role => ({
                    id: role.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ManageMessages,
                        PermissionFlagsBits.ManageChannels
                    ]
                }))
            ]
        });

        Object.defineProperty(ticketChannel, 'channelId', {
            value: channel.id,
            writable: false
        });

        return ticketChannel;
    }

    public async moveTicketToClosedCategory(
        guild: Guild,
        channelId: string
    ): Promise<boolean> {
        const settings = this.getSettings(guild.id);
        if (!settings) return false;

        const channel = guild.channels.cache.get(channelId) as TextChannel;
        const closedCategory = guild.channels.cache.get(settings.closedCategoryId) as CategoryChannel;

        if (!channel || !closedCategory) return false;

        await channel.setParent(closedCategory);
        return true;
    }

    public getUserTicketCount(guild: Guild, userId: string): number {
        const settings = this.getSettings(guild.id);
        if (!settings) return 0;

        const openCategory = guild.channels.cache.get(settings.openCategoryId) as CategoryChannel;
        if (!openCategory) return 0;

        return openCategory.children.cache.filter(channel => {
            if (channel.type !== ChannelType.GuildText) return false;
            const ticketChannel = TicketChannel.fromChannelName(channel.name, guild.id);
            return ticketChannel?.isOwnedBy(userId);
        }).size;
    }

    public canUserCreateTicket(guild: Guild, userId: string): boolean {
        return this.getUserTicketCount(guild, userId) < 2;
    }

}