import { Client, Events, GatewayIntentBits } from "discord.js";
import { onReady } from "./events/onReady";
import { TicketManager } from "./modules/ticket/TicketManager";
import { CommandManager } from "./core/CommandManager";
import { TicketCommand } from "./modules/ticket/commands/TicketCommand";
import { onInteractionCreate } from "./events/onInteractionCreate";

export class BotManager {
    private readonly client: Client;
    private readonly commandManager: CommandManager;
    private readonly ticketManager: TicketManager;

    constructor(private readonly token: string) {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers
            ]
        });

        this.commandManager = new CommandManager(this.client);
        this.ticketManager = new TicketManager();

        this.setupCommands();
        this.setupEvents();
    }

    public async start(): Promise<void> {
        await this.client.login(this.token);

        if (this.client.user) {
            await this.commandManager.deployCommands(this.token, this.client.user.id);
        }
    }

    private setupEvents(): void {
        this.client.once(Events.ClientReady, () => onReady(this.client));
        this.client.on(Events.InteractionCreate, (interaction) => onInteractionCreate(interaction, this.commandManager, this.ticketManager));
    }

    public setupCommands(): void {
        this.commandManager.addCommand(new TicketCommand(this.ticketManager));
    }
}