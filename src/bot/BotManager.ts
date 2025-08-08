import { Client, GatewayIntentBits } from "discord.js";

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
    }

    public async start(): Promise<void> {
        await this.client.login(this.token);
        console.log("Bot is now online!");
    }
}