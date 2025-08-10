import { Client, Collection, REST, Routes } from "discord.js";
import { BaseCommand } from "./BaseCommand";

export class CommandManager {
    private commands: Collection<string, BaseCommand> = new Collection();

    constructor (private client: Client) {}

    public addCommand(command: BaseCommand): void {
        this.commands.set(command.data.name, command);
    }

    public getCommand(name: string): BaseCommand | undefined {
        return this.commands.get(name);
    }

    public async deployCommands(token: string, clientId: string): Promise<void> {
        const rest = new REST().setToken(token);
        const commandData = this.commands.map(command => command.data.toJSON());

        try {
            console.log("Started refreshing application (/) commands.");
            await rest.put(Routes.applicationCommands(clientId), { body: commandData });
            console.log("Successfully reloaded application (/) commands.");
        } catch (error) {
            console.log("Error while deploying commands:", error);
        }
    }

    public getCommands(): Collection<string, BaseCommand> {
        return this.commands;
    }
}