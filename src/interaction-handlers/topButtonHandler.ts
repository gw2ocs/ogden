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
		const quizId = parsedData.quizId;
		const _t = await fetchT(interaction);
		const quiz = await this.container.client.quizzes.getQuiz(Number(quizId));
		if (!quiz) {
			return interaction.reply({ content: _t('quiz:quizOver'), flags: MessageFlags.Ephemeral });
		}

		const items: EmbedField[] = [];
		const timestamp = new Timestamp('HH:mm:ss:SSS');

		const winners = quiz.winners.sort((a, b) => a.resolutionDuration! - b.resolutionDuration!);

		const podiumKeys = ['first', 'second', 'third'];
		for (const [i, entry] of winners.slice(0, 3).entries()) {
			items.push({ name: _t(`quiz:top:${podiumKeys[i]}`, { user: entry.user.username }), value: timestamp.display(entry.resolutionDuration!), inline: false });
		}

		for (const [i, entry] of winners.slice(3).entries()) {
			items.push({ name: _t('quiz:top:remaining', { user: entry.user.username, count: i+3, ordinal: true }), value: timestamp.display(entry.resolutionDuration!), inline: false });
		}

		const paginatedMessage = new PaginatedMessageEmbedFields()
			.setTemplate({ title: _t('quiz:top:title', { question: quiz.question.title }), color: 0xffd700 })
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
