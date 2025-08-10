import { TicketStatus } from "./TicketStatus";
import { TicketType } from "./TicketType";

export interface TicketChannelData {
    channelId: string;
    userId: string;
    guildId: string;
    type: TicketType;
    status: TicketStatus;
    createdAt: Date;
    closedAt?: Date;   
}