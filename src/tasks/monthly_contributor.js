const { Task } = require('klasa');
const { DateTime } = require('luxon');
const fetch = require('node-fetch');

module.exports = class extends Task {

	constructor(...args) {
		super(...args, { enabled: true });
	}

	async run(metadata) {
		const today = DateTime.local().minus({ months: 1 });
		const count_by_users = await fetch(`${process.env.WEBSITEURL}/api/graphql`, {
                method: "post",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: `{
						allQuestions(filter: {validated: {isNull: false}, createdAt: {greaterThanOrEqualTo: "${today.toFormat('yyyy-LL-01')}"}}) {
							nodes { userByUserId { discordId } }
						}
                    }`
                })
            })
                .then(response => response.json())
                .then(response => {
					const count_by_users = {};
					for (let i = 0, imax = response.data.allQuestions.nodes.length ; i < imax ; i++) {
						const question = response.data.allQuestions.nodes[i];
						count_by_users[question.userByUserId.discordId] = (count_by_users[question.userByUserId.discordId] || 0) + 1;
					}
					console.log(count_by_users);
					return count_by_users;
				});
		const guilds = [...this.client.guilds.cache.values()];
		for (let i = 0, imax = guilds.length ; i < imax ; i++) {
			const guild = guilds[i];
			const role_id = guild.settings.permissions.monthly_contributor;
			const news_channel = guild.channels.resolve(guild.settings.channels.news);
			if (!role_id) continue;
			// fetch the role
			const role = guild.roles.resolve(role_id);
			if (!role) continue;
			// reset previous monthly contributor
			const previous = [...role.members.values()];
			for (let j = 0, jmax = previous.length ; j < jmax ; j++) {
				previous[j].roles.remove(role);
			}
			const list = Object.keys(count_by_users).sort((a, b) => count_by_users[b] - count_by_users[a]);
			
			// check first user present in list
			for (let j = 0, jmax = list.length ; j < jmax ; j++) {
				const user = guild.members.resolve(list[j]);
				if (user) {
					// give it the role
					news_channel.send(`Félicitations à <@${list[j]}> qui a obtenu le rôle de ${role} avec ${count_by_users[list[j]]} questions postées ce mois-ci.`);
					user.roles.add(role);
					break;
				}
			}
		}
	}

	async init() {
		if (!this.client.schedule._tasks.some(t => t.id === 'monthly_contributor')) {
			this.client.schedule.create('monthly_contributor', '5 0 1 * *', {
				data: {},
				catchUp: true,
				id: 'monthly_contributor'
			});
		}
	}

};
