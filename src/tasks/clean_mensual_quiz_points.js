const { Task } = require('klasa');

module.exports = class extends Task {

	constructor(...args) {
		super(...args, { enabled: true });
	}

	async run(metadata) {
		const guilds = [...this.client.guilds.cache.values()];
		console.log(guilds.length);
		for (let i = 0, imax = guilds.length ; i < imax ; i++) {
			console.log(guilds[i].name);
			//const users = [...(await guilds[i].members.fetch()).map(m => m.user).filtered(u => u.settings._existsInDB)];
			(await guilds[i].members.fetch()).map(m => m.user)/*.filter(u => u.settings._existsInDB)*/.forEach(u => u.settings.update({mensual_quiz_points: 0}));
			this.client.pg.query(`UPDATE gw2trivia.scores s SET amount = 0 FROM gw2trivia.activities a WHERE activity_id = a.id AND a.ref = 'quiz_mensual'`);
			/*
			console.log(users.length)
			for (let j = 0, jmax = users.length ; j < jmax ; j++) {
				const user = users[j];
				console.log(user.username);
				console.log(user.settings.mensual_quiz_points);
				if (!user.settings._existsInDB) continue;
				console.log('here');
				user.settings.update('mensual_quiz_points', 0);
			}*/
		}
	}

	async init() {
		if (!this.client.schedule._tasks.some(t => t.id === 'clean_mensual_quiz_points')) {
			this.client.schedule.create('clean_mensual_quiz_points', '30 0 1 * *', {
				data: {},
				catchUp: true,
				id: 'clean_mensual_quiz_points'
			});
		}
	}

};
