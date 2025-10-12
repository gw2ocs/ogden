import type { PartialResponseValue } from '#lib/database';
import { Task } from '#lib/structures';
import { EmbedBuilder } from 'discord.js';
import { MoreThan } from 'typeorm';

export class UserTask extends Task {

	public async run(): Promise<PartialResponseValue | null> {
		const { client, db, logger } = this.container;
		logger.info('Running fetchNewAchievements task...');

		const guilds = [...client.guilds.cache.values()];
		const settings = await db.clients.ensure();
		logger.info(`Settings: ${JSON.stringify(settings)}`);
		const { lastAchievementCheck } = settings;
		const achievements = await db.achievementsUsersRels.find({
			where: {
				createdAt: MoreThan(lastAchievementCheck || new Date(0)),
			},
			relations: ['user', 'achievement'],
		});
		if (!achievements.length) return null;

		for (let i = 0, imax = guilds.length ; i < imax ; i++) {
			const guild = guilds[i];
			const guildDb = await db.guilds.findOne({ where: { discordId: guild.id } } );
			const newsChannel = guildDb?.newsChannel;
			if (!newsChannel) continue;
			const channel = guild.channels.resolve(newsChannel);
			if (!channel || !channel.isSendable()) continue;
			for (let j = 0, jmax = achievements.length ; j < jmax ; j++) {
				const achievement = achievements[j];
				const embed = new EmbedBuilder()
					.setColor(0x00c7ff)
					.setTimestamp(new Date(achievement.createdAt))
					.addFields(
						{ name: achievement.achievement.name, value: `${achievement.achievement.description}` })
					.setDescription(`Nouveau succès obtenu par <@${achievement.user.discordId}>.`)
					.setImage(`https://assets.gw2achievements.com/${encodeURIComponent(achievement.achievement.name)}.png?l=fr&s=completed&i=${achievement.achievement.icon}&t=${achievement.achievement.theme}`);
				await channel.send({ embeds: [embed] }).catch(logger.error);
			}
		}

		settings.lastQuestionCheck = new Date();
		await db.clients.save(settings);
		logger.info(`Posted ${achievements.length} new achievements to news channels.`);

		return null;
	}
}
