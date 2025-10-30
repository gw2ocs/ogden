import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { ApplicationIntegrationType, InteractionContextType, type Message } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Présentation d\'Ogden.',
	aliases: ['bot-info'],
	detailedDescription: [
		'Je suis Ogden Guéripierre, le dernier des Nains.',
		"Comme mon travail au Prieuré me laisse beaucoup de temps libre, j'ai décidé de mettre à l'épreuve les aventuriers.",
		"Ainsi donc, pour m'assurer que l'histoire de la Tyrie ne soit pas oubliée, je pose des questions sur le passé, le présent et diverses choses.",
		'',
		"Si vous souhaitez ne manquer aucune question, vous pouvez vous abonner en écrivant `Ogden, subscribe`. Vous serez ainsi notifié lorsque je m'apprète à poser ma question.",
		"Pour plus d'informations, rendez-vous sur <https://gw2trivia.com>."
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
