import { ChannelType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { BaseCommand } from "../../../core/BaseCommand";
import { TicketSetupSubCommand } from "./subcommands/TicketSetupSubCommand";
import { TicketManager } from "../TicketManager";
import { TicketCloseSubCommand } from "./subcommands/TicketCloseSubCommand";
import { TicketOpenSubCommand } from "./subcommands/TicketOpenSubCommand";


export class TicketCommand extends BaseCommand {
    public data = new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Sistema de gestión de tickets')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Configura el sistema de tickets')
                .addChannelOption(option =>
                    option
                        .setName('canal')
                        .setDescription('Canal donde se enviará el mensaje de tickets')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText)
                )
                .addChannelOption(option =>
                    option
                        .setName('categoria-abiertos')
                        .setDescription('Categoría para tickets abiertos')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildCategory)
                )
                .addChannelOption(option =>
                    option
                        .setName('categoria-cerrados')
                        .setDescription('Categoría para tickets cerrados')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildCategory)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('close')
                .setDescription('Cierra el ticket actual')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('open')
                .setDescription('Crea un ticket manualmente para un usuario')
                .addUserOption(option =>
                    option
                        .setName('usuario')
                        .setDescription('Usuario para quien crear el ticket')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('tipo')
                        .setDescription('Tipo de ticket a crear')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Normal', value: 'normal' },
                            { name: 'Donación', value: 'donation' }
                        )
                )
        );

    private setupSubCommand: TicketSetupSubCommand;
    private closeSubCommand: TicketCloseSubCommand;
    private openSubCommand: TicketOpenSubCommand;

    constructor(ticketManager: TicketManager) {
        super();
        this.setupSubCommand = new TicketSetupSubCommand(ticketManager);
        this.closeSubCommand = new TicketCloseSubCommand(ticketManager);
        this.openSubCommand = new TicketOpenSubCommand(ticketManager);
    }

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        if (!interaction.guild) {
            await interaction.reply({ 
                content: 'Este comando solo puede ser usado en un servidor.', 
                ephemeral: true 
            });
            return;
        }

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'setup':
                await this.setupSubCommand.execute(interaction);
                break;
            case 'close':
                await this.closeSubCommand.execute(interaction);
                break;
            case 'open':
                await this.openSubCommand.execute(interaction);
                break;
            default:
                await interaction.reply({
                    content: '❌ Subcomando no reconocido.',
                    ephemeral: true
                });
        }
    }
}