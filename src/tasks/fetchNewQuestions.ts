import type { PartialResponseValue } from '#lib/database';
import { Task } from '#lib/structures';
import { EmbedBuilder } from 'discord.js';
import { MoreThan } from 'typeorm';

export class UserTask extends Task {

	public async run(): Promise<PartialResponseValue | null> {
		const { client, db, logger } = this.container;
		logger.info('Running fetchNewQuestions task...');

		const guilds = [...client.guilds.cache.values()];
		const settings = await db.clients.ensure();
		logger.info(`Settings: ${JSON.stringify(settings)}`);
		const { lastQuestionCheck } = settings;
		const questions = await db.questions.find({
			where: {
				createdAt: MoreThan(lastQuestionCheck || new Date(0)),
			},
			relations: ['user', 'categories'],
		});
		if (!questions.length) return null;

		for (let i = 0, imax = guilds.length ; i < imax ; i++) {
			const guild = guilds[i];
			const guildDb = await db.guilds.findOne({ where: { discordId: guild.id } } );
			const newsChannel = guildDb?.newsChannel;
			if (!newsChannel) continue;
			const channel = guild.channels.resolve(newsChannel);
			if (!channel || !channel.isSendable()) continue;
			if (questions.length > 1) {
				await channel.send(`${questions.length} nouvelles questions ont été postées sur <https://gw2trivia.com>:`).catch(logger.error);
			} else {
				await channel.send(`Une nouvelle question a été postée sur <https://gw2trivia.com>:`).catch(logger.error);
			}
			for (let j = 0, jmax = questions.length ; j < jmax ; j++) {
				const question = questions[j];
				const embed = new EmbedBuilder()
					.setColor(0x00c7ff)
					.setAuthor({ name: question.user.username, iconURL: question.user.avatarUrl || undefined, url: `https://gw2trivia.com/questions?user_id=${question.user.id}`})
					.setTimestamp(new Date(question.createdAt))
					.setTitle(/*question.spoil ? `||${question.title}||` :*/ question.title)
					.setURL(`https://gw2trivia.com/questions/view/${question.id}/${question.slug}`)
					.addFields(
						{ name: 'Points', value: `${question.points}`, inline: true }, 
						{ name: 'Auteur', value: `<@${question.user.discordId}>`, inline: true })
				if (question.categories.length) {
					embed.addFields({ name: 'Categories', value: question.categories.map(q => q.name).join(', ') });
				}
				await channel.send({ embeds: [embed] }).catch(logger.error);
			}
		}

		settings.lastQuestionCheck = new Date();
		await db.clients.save(settings);
		logger.info(`Posted ${questions.length} new questions to news channels.`);

		return null;
	}
}
