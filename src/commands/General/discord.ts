import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { ApplicationIntegrationType, InteractionContextType, type Message } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Discord de Questions pour un Quaggan',
	detailedDescription: [
		"Pour profiter pleinement de l'expérience, rejoignez le serveur Discord officiel de [Questions pour un Quaggan](https://discord.gg/EWAzDQN) !",
	].join('\n')
})
export class UserCommand extends Command {
	// Register slash and context menu command
	public override registerApplicationCommands(registry: Command.Registry) {
		// Create shared integration types and contexts
		// These allow the command to be used in guilds and DMs
		const integrationTypes: ApplicationIntegrationType[] = [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall];
		const contexts: InteractionContextType[] = [
			InteractionContextType.BotDM,
			InteractionContextType.Guild,
			InteractionContextType.PrivateChannel
		];

		// Register slash command
		registry.registerChatInputCommand({
			name: this.name,
			description: this.description,
			integrationTypes,
			contexts
		});
	}

	// Message command
	public override async messageRun(message: Message) {
		return send(message, this.detailedDescription);
	}

	// slash command
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		return interaction.reply({ content: this.detailedDescription.toString() });
	}

	// context menu command
	public override async contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
		return interaction.reply({ content: this.detailedDescription.toString() });
	}
}
