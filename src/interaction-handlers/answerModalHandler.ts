import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { MessageFlags, type ModalSubmitInteraction } from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.ModalSubmit
})
export class ModalHandler extends InteractionHandler {
	public async run(interaction: ModalSubmitInteraction, parsedData: InteractionHandler.ParseResult<this>) {
		const quizId = parsedData.quizId;
		const quiz = this.container.client.quizzes.getQuiz(Number(quizId));
		if (!quiz) {
			return interaction.reply({ content: 'Le quiz est terminé.', flags: MessageFlags.Ephemeral });
		}
		
		if (quiz.hasUserAnswered(interaction.user)) {
			return interaction.reply({ content: 'Tu as déjà répondu a cette question.', flags: MessageFlags.Ephemeral });
		}
		
		if (quiz.testAnswer(interaction.fields.getTextInputValue('quizAnswerInput'))) {
			quiz.addWinner(interaction.user);
			return interaction.reply({
				content: 'Bonne réponse ! 🎉',
				flags: MessageFlags.Ephemeral
			});
		}
		return interaction.reply({
			content: 'Ce n\'est pas la bonne réponse.',
			flags: MessageFlags.Ephemeral
		});
	}

	public override parse(interaction: ModalSubmitInteraction) {
		if (!interaction.customId.startsWith('quiz_modal_')) return this.none();

		const quizId = interaction.customId.replace('quiz_modal_', '');

		return this.some({ quizId });
	}
}
