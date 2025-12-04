import { ApplyOptions } from '@sapphire/decorators';
import { PaginatedMessageEmbedFields } from '@sapphire/discord.js-utilities';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { fetchT } from '@sapphire/plugin-i18next';
import { Timestamp } from '@sapphire/time-utilities';
import { MessageFlags, type ButtonInteraction, type EmbedField } from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public async run(interaction: ButtonInteraction, parsedData: InteractionHandler.ParseResult<this>) {
		await interaction.deferReply({ ephemeral: true });
		const quizId = parsedData.quizId;
		const _t = await fetchT(interaction);
		const quiz = await this.container.client.quizzes.getQuiz(Number(quizId));
		const user = interaction.user;
		let position = 0;

		if (!quiz) {
			return interaction.reply({ content: _t('quiz:quizOver'), flags: MessageFlags.Ephemeral });
		}

		const items: EmbedField[] = [];
		const timestamp = new Timestamp('HH:mm:ss:SSS');

		const winners = quiz.winners.sort((a, b) => a.resolutionDuration! - b.resolutionDuration!);

		const podiumKeys = ['first', 'second', 'third'];
		for (const [i, entry] of winners.slice(0, 3).entries()) {
			items.push({ name: _t(`quiz:top:${podiumKeys[i]}`, { user: entry.user.username }), value: timestamp.display(entry.resolutionDuration!), inline: false });
			if (entry.user.discordId === user.id) {
				position = i + 1;
			}
		}

		for (const [i, entry] of winners.slice(3).entries()) {
			items.push({ name: _t('quiz:top:remaining', { user: entry.user.username, count: i+4, ordinal: true }), value: timestamp.display(entry.resolutionDuration!), inline: false });
			if (entry.user.discordId === user.id) {
				position = i + 4;
			}
		}

		let description = quiz.question.title;

		if (position > 0) {
			description += `\n\n${_t('quiz:top:yourPosition')} **#${position}**`;
		}

		const paginatedMessage = new PaginatedMessageEmbedFields()
			.setTemplate({ title: _t('quiz:top:title'), color: 0xffd700, description })
			.setItemsPerPage(10)
			.setItems(items);

		return paginatedMessage.make().run(interaction);

		//return interaction.reply({ content: quiz.getTopList(), flags: MessageFlags.Ephemeral });
	}

	public override parse(interaction: ButtonInteraction) {
		if (!interaction.customId.startsWith('quiz_top_')) return this.none();

		const quizId = interaction.customId.replace('quiz_top_', '');

		return this.some({ quizId });
	}
}
