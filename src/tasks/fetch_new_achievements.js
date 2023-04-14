const { Task } = require('klasa');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = class extends Task {

	constructor(...args) {
		super(...args, { enabled: true });
	}

	async post_new_achievement(guild, channel, achievement) {
		const embed = new MessageEmbed()
			.setColor(0xc4bc14)
			.setTimestamp(new Date(achievement.createdAt))
			.addField(achievement.achievementByAchievementId.name, achievement.achievementByAchievementId.description)
			.setDescription(`Nouveau succès obtenu par <@${achievement.userByUserId.discordId}>.`)
			.setImage(`https://assets.gw2achievements.com/${encodeURIComponent(achievement.achievementByAchievementId.name)}.png?l=fr&s=completed&i=${achievement.achievementByAchievementId.icon}&t=${achievement.achievementByAchievementId.theme}`);
		channel.send({ embed });
	}

	async run(metadata) {
		const guilds = [...this.client.guilds.cache.values()];
		for (let i = 0, imax = guilds.length ; i < imax ; i++) {
			const guild = guilds[i];
			const last_cursor = this.client.settings.last_achievement_cursor;
			const news_channel = guild.channels.resolve(guild.settings.channels.news);
			if (!news_channel) continue;
			const query = `{
						allAchievementsUsersRels(${last_cursor && `after: ${JSON.stringify(last_cursor)}, ` || ''}orderBy: CREATED_AT_ASC) {
							nodes {
								userByUserId { id discordId username discriminator avatarUrl }
								achievementByAchievementId { description icon name theme }
								createdAt
							}
							pageInfo { endCursor }
						}
					}`;
			const token = this.client.getJwtToken();
			fetch('https://gw2trivia.com/api/graphql', {
                method: "post",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
					'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({ query })
            })
                .then(response => response.json())
                .then(async response => {
				if (response.data.allAchievementsUsersRels.pageInfo.endCursor) {
					this.client.settings.update('last_achievement_cursor', response.data.allAchievementsUsersRels.pageInfo.endCursor);
					this.client.settings.sync();
				}
				for (let i = 0, imax = response.data.allAchievementsUsersRels.nodes.length ; i < imax ; i++) {
					const achievement = response.data.allAchievementsUsersRels.nodes[i];
					await this.post_new_achievement(guild, news_channel, achievement);
				}
			});
		}
	}

	async init() {
		if (!this.client.schedule._tasks.some(t => t.id === 'fetch_new_achievements')) {
			this.client.schedule.create('fetch_new_achievements', '*/5 * * * *', {
				data: {},
				catchUp: true,
				id: 'fetch_new_achievements'
			});
		}
	}

};
