import type { PartialResponseValue } from '#lib/database';
import { Task } from '#lib/structures';
import { EmbedBuilder } from 'discord.js';
import { MoreThan } from 'typeorm';

export class UserTask extends Task {

	public async run(): Promise<PartialResponseValue | null> {
		const { client, db, logger } = this.container;
		logger.info('Running fetchNewArticles task...');

		const guilds = [...client.guilds.cache.values()];
		const settings = await db.clients.ensure();
		logger.info(`Settings: ${JSON.stringify(settings)}`);
		const { lastArticleCheck } = settings;
		const articles = await db.articles.find({
			where: {
				validatedAt: MoreThan(lastArticleCheck || new Date(0)),
			},
			relations: ['user', 'categories'],
		});
		if (!articles.length) return null;

		for (let i = 0, imax = guilds.length ; i < imax ; i++) {
			const guild = guilds[i];
			const guildDb = await db.guilds.findOne({ where: { discordId: guild.id } } );
			const newsChannel = guildDb?.newsChannel;
			if (!newsChannel) continue;
			const channel = guild.channels.resolve(newsChannel);
			if (!channel || !channel.isSendable()) continue;
			if (articles.length > 1) {
				await channel.send(`${articles.length} nouveaux articles ont été publiés sur <https://gw2trivia.com>:`).catch(logger.error);
			} else {
				await channel.send(`Un nouvel article a été publié sur <https://gw2trivia.com>:`).catch(logger.error);
			}
			for (let j = 0, jmax = articles.length ; j < jmax ; j++) {
				const article = articles[j];
				const embed = new EmbedBuilder()
					.setColor(0x8080ff)
					.setAuthor({ name: article.user.username, iconURL: article.user.avatarUrl || undefined, url: `${process.env.WEBSITEURL}/questions?user_id=${article.user.id}`})
					.setTimestamp(new Date(article.validatedAt!))
					.setTitle(article.title)
					.setURL(`${process.env.WEBSITEURL}/articles/view/${article.id}/${article.slug}`)
					.addFields(
						{ name: 'Auteur', value: `<@${article.user.discordId}>`, inline: true })
				if (article.categories.length) {
					embed.addFields({ name: 'Categories', value: article.categories.map(q => q.name).join(', ') });
				}
				await channel.send({ embeds: [embed] }).catch(logger.error);
			}
		}

		settings.lastArticleCheck = new Date();
		await db.clients.save(settings);
		logger.info(`Posted ${articles.length} new articles to news channels.`);

		return null;
	}
}
