const { Task } = require('klasa');
const fetch = require('node-fetch');

module.exports = class extends Task {

	constructor(...args) {
		super(...args, { enabled: true });
	}

	async run(metadata) {
		const guilds = [...this.client.guilds.cache.values()];
		for (let i = 0, imax = guilds.length ; i < imax ; i++) {
			const guild = guilds[i];
			const role_id = guild.settings.permissions.monthly_winner;
			const news_channel = guild.channels.resolve(guild.settings.channels.news);
			if (!role_id) continue;
			// fetch the role
			const role = guild.roles.resolve(role_id);
			if (!role) continue;
			// reset previous monthly winner
			const previous = [...role.members.values()];
			for (let j = 0, jmax = previous.length ; j < jmax ; j++) {
				previous[j].roles.remove(role);
			}
			const { rowCount: scoreCount, rows: scoreRows } = await this.client.pg.query(`SELECT u.discord_id AS uid, amount FROM gw2trivia.scores s
			LEFT JOIN gw2trivia.activities act ON act.id = s.activity_id
			LEFT JOIN gw2trivia.users u ON u.id = s.user_id
			WHERE act.ref = 'quiz_mensual' AND act.guild_id = '${guild.id}' AND amount > 0
			ORDER BY amount desc
			LIMIT 3`);
			if (scoreCount) {
				const texts = [];
				const first = guild.members.resolve(scoreRows[0].uid);
				if (first) {
					first.roles.add(role);
					texts.push(`Félicitations à ${first} qui a obtenu le rôle de ${role} avec ${scoreRows[0].amount} points ce mois-ci.`);
				}
				if (scoreCount > 2) {
					const second = guild.members.resolve(scoreRows[1].uid);
					const third = guild.members.resolve(scoreRows[2].uid);
					if (second && third) {
						texts.push(`Bravo également à ${second} (${scoreRows[1].amount} points) et à ${third} (${scoreRows[2].amount} points).`)
					}
				}
				if (texts) {
					news_channel.send(texts.join('\n'))
				}
			}
			/*const list = (await guild.members.fetch())
				.filter(member => member.user.settings._existsInDB && member.user.settings.mensual_quiz_points)
				.sort((memberA, memberB) => memberB.user.settings.mensual_quiz_points - memberA.user.settings.mensual_quiz_points);
			if (list) {
				list.first().roles.add(role);
				news_channel.send(`Félicitations à ${list.first()} qui a obtenu le rôle de ${role} avec ${list.first().user.settings.mensual_quiz_points} points ce mois-ci.`);
			}*/
		}
	}

	async init() {
		if (!this.client.schedule._tasks.some(t => t.id === 'monthly_winner')) {
			this.client.schedule.create('monthly_winner', '5 0 1 * *', {
				data: {},
				catchUp: true,
				id: 'monthly_winner'
			});
		}
	}

};
