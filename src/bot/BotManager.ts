import { Client, Events, GatewayIntentBits } from "discord.js";
import { onReady } from "./events/onReady";

export class BotManager {
    private readonly client: Client;

    constructor(private readonly token: string) {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers
            ]
        });

        this.setupEvents();
    }

    public async start(): Promise<void> {
        await this.client.login(this.token);
    }

    private setupEvents(): void {
        this.client.once(Events.ClientReady, () => onReady(this.client));
    }
}