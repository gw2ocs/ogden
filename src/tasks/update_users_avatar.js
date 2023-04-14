const { Task } = require('klasa');
const fetch = require('node-fetch');

module.exports = class extends Task {

	constructor(...args) {
		super(...args, { enabled: true });
	}

	async run(metadata) {
		const token = this.client.getJwtToken();
		const fetch_query = `{
					allUsers { nodes { id discordId avatar } }
				}`;

		const users = await fetch('https://gw2trivia.com/api/graphql', {
			method: "post",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ query: fetch_query })
		})
			.then(response => response.json())
			.then(response => response.data.allUsers.nodes)
			.catch(console.error);
		
		for (let i = 0, imax = users.length ; i < imax ; i++) {
			const u = await this.client.users.fetch(users[i].discordId);
			if (!u) continue;
			if (u.avatar !== users[i].avatar) {
				const update_query = `mutation { updateUserByDiscordId(input: {userPatch: {avatar: ${JSON.stringify(u.avatar)}}, discordId: ${JSON.stringify(u.id)}}) { clientMutationId } }`;
				console.log(update_query);
				fetch('https://gw2trivia.com/api/graphql', {
					method: "post",
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json',
						'Authorization': token ? `Bearer ${token}` : '',
					},
					body: JSON.stringify({ query: update_query })
				}).then(response => response.json())
				  .then(response => {
					console.log(JSON.stringify(response));
				}).catch(console.error);
			}
		}
	}

	async init() {
		if (!this.client.schedule._tasks.some(t => t.id === 'update_users_avatar')) {
			this.client.schedule.create('update_users_avatar', '0 */2 * * *', {
				data: {},
				catchUp: true,
				id: 'update_users_avatar'
			});
		}
	}

};
