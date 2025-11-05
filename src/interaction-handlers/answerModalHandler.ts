import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { fetchT } from '@sapphire/plugin-i18next';
import { MessageFlags, type ModalSubmitInteraction } from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.ModalSubmit
})
export class ModalHandler extends InteractionHandler {
	public async run(interaction: ModalSubmitInteraction, parsedData: InteractionHandler.ParseResult<this>) {
		const quizId = parsedData.quizId;
		const _t = await fetchT(interaction);
		const quiz = await this.container.client.quizzes.getQuiz(Number(quizId));
		if (!quiz) {
			return interaction.reply({ content: _t('quiz:quizOver'), flags: MessageFlags.Ephemeral });
		}
		
		if (quiz.hasUserAnswered(interaction.user)) {
			return interaction.reply({ content: _t('quiz:alreadyAnswered'), flags: MessageFlags.Ephemeral });
		}
		
		if (quiz.testAnswer(interaction.fields.getTextInputValue('quizAnswerInput'))) {
			quiz.addWinner(interaction.user);
			return interaction.reply({
				content: _t('quiz:goodAnswer', { points: _t('misc:points', { count: quiz.points }) }),
				flags: MessageFlags.Ephemeral
			});
		}
		return interaction.reply({
			content: _t('quiz:wrongAnswer'),
			flags: MessageFlags.Ephemeral
		});
	}

	public override parse(interaction: ModalSubmitInteraction) {
		if (!interaction.customId.startsWith('quiz_modal_')) return this.none();

		const quizId = interaction.customId.replace('quiz_modal_', '');

		return this.some({ quizId });
	}
}
