export class TicketSettings {
    public readonly guildId: string;
    public readonly ticketChannelId: string;
    public readonly openCategoryId: string;
    public readonly closedCategoryId: string;

    constructor(guildId: string, ticketChannelId: string, openCategoryId: string, closedCategoryId: string) {
        this.guildId = guildId;
        this.ticketChannelId = ticketChannelId;
        this.openCategoryId = openCategoryId;
        this.closedCategoryId = closedCategoryId;
    }
}