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
			const { last_achievement_check } = await this.client.getDBClient(this.client);
			const news_channel = guild.channels.resolve(guild.settings.channels.news);
			if (!news_channel) continue;
			const query = `{
						allAchievementsUsersRels(${last_achievement_check && `filter: {createdAt: {greaterThan: ${JSON.stringify(last_achievement_check)}}}, ` || ''}orderBy: CREATED_AT_ASC) {
							nodes {
								userByUserId { id discordId username discriminator avatarUrl }
								achievementByAchievementId { description icon name theme }
								createdAt
							}
						}
					}`;
			const token = this.client.getJwtToken();
			fetch(`${process.env.WEBSITEURL}/api/graphql`, {
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
				await this.client.pg.query('UPDATE gw2trivia.clients SET last_achievement_check = $1 WHERE discord_id = $2', [(new Date()).toLocaleString('en-US-u-hc-h23', {timeZone: 'Europe/Paris', dateStyle: "short", timeStyle: "medium"}), this.client.user.id]);
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
