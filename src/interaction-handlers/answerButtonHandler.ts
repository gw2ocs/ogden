import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { fetchT } from '@sapphire/plugin-i18next';
import { MessageFlags, type ButtonInteraction } from 'discord.js';

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

		if (quiz.hasUserAnswered(interaction.user)) {
			return interaction.reply({ content: _t('quiz:alreadyAnswered'), flags: MessageFlags.Ephemeral });
		}
		
		const modal = quiz.getModal();
		return interaction.showModal(modal);
	}

	public override parse(interaction: ButtonInteraction) {
		if (!interaction.customId.startsWith('quiz_answer_')) return this.none();

		const quizId = interaction.customId.replace('quiz_answer_', '');

		return this.some({ quizId });
	}
}
