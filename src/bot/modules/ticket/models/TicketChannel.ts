import { TicketChannelData } from "../types/TicketChannelData";
import { TicketStatus } from "../types/TicketStatus";
import { TicketType } from "../types/TicketType";

export class TicketChannel {
    public readonly channelId: string;
    public readonly userId: string;
    public readonly guildId: string;
    public readonly type: TicketType;
    public readonly createdAt: Date;
    private _status: TicketStatus;
    private _closedAt?: Date;

    constructor(data: TicketChannelData) {
        this.channelId = data.channelId;
        this.userId = data.userId;
        this.guildId = data.guildId;
        this.type = data.type;
        this.createdAt = data.createdAt;
        this._status = data.status;
        this._closedAt = data.closedAt;
    }

    public get status(): TicketStatus {
        return this._status;
    }

    public get closedAt(): Date | undefined {
        return this._closedAt;
    }

    public close(): void {
        this._status = TicketStatus.CLOSED;
        this._closedAt = new Date();
    }

    public reopen(): void {
        this._status = TicketStatus.OPEN;
        this._closedAt = undefined;
    }

    public isOwnedBy(userId: string): boolean {
        return this.userId === userId;
    }

    public static fromChannelName(channelName: string, guildId: string): TicketChannel | null {
        const match = channelName.match(/^ticket-(normal|donation)-(\d+)-(\d+)$/);
        if (!match) return null;

        const [, type, userId, timestamp] = match;
        const createdAt = new Date(parseInt(timestamp, 10));

        return new TicketChannel({
            channelId: '',
            userId,
            guildId,
            type: type as TicketType,
            status: TicketStatus.OPEN,
            createdAt,
        })
    }

    public generateChannelName(): string {
        return `ticket-${this.type}-${this.userId}-${this.createdAt.getTime()}`;
    }
}