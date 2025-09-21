import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { ApplicationCommandType, ApplicationIntegrationType, InteractionContextType, type Message } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Obtenez des informations sur la façon d\'aider Ogden dans ses projets.',
	aliases: ['donation'],
	detailedDescription: [
		`Le projet de Questions pour un Quaggan a commencé en 2018 et n'était, à l'origine, qu'un bot avec quelques questions. Depuis, le projet a bien évolué et comprend maintenant le site <https://gw2trivia.com>, de nombreux articles sur le lore et plus de 4000 questions`,
		'',
		`Cependant, tout n'est pas gratuit et nous avons besoin de votre aide pour garder Ogden en vie.`,
		`Nous serons très reconnaissants si vous nous aidez.`,
		`Nous avons travaillé sur beaucoup de choses et d'autres sont encore à venir. Ogden nous est précieux. Prenez soin de lui.`,
		'',
		`Vous souhaitez soutenir ce projet ? N'hésitez pas à le faire ! <https://paypal.me/pandraghon>`,
		`Plus d'informations sur https://gw2trivia.com/about/support`
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

		// Register context menu command available from any message
		registry.registerContextMenuCommand({
			name: this.name,
			type: ApplicationCommandType.Message,
			integrationTypes,
			contexts
		});

		// Register context menu command available from any user
		registry.registerContextMenuCommand({
			name: this.name,
			type: ApplicationCommandType.User,
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
