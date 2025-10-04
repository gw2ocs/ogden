import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { MessageFlags, type ButtonInteraction } from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public async run(interaction: ButtonInteraction, parsedData: InteractionHandler.ParseResult<this>) {
		const quizId = parsedData.quizId;
		const quiz = this.container.client.quizzes.getQuiz(Number(quizId));
		if (!quiz) {
			return interaction.reply({ content: 'Le quiz est terminé.', flags: MessageFlags.Ephemeral });
		}

		if (quiz.hasUserAnswered(interaction.user)) {
			return interaction.reply({ content: 'Tu as déjà répondu a cette question.', flags: MessageFlags.Ephemeral });
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
