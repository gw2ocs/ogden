const { Task } = require('klasa');

module.exports = class extends Task {

	constructor(...args) {
		super(...args, { enabled: true });
	}

	async run(metadata) {
		const users = [...(await this.client.users.fetch()).values()];
		for (let i = 0, imax = users.length ; i < imax ; i++) {
			const user = users[i];
			if (!user.settings._existsInDB) continue;
			user.settings.update('annual_quiz_points', 0);
		}
		this.client.pg.query(`UPDATE gw2trivia.scores s SET amount = 0 FROM gw2trivia.activities a WHERE activity_id = a.id AND a.ref = 'quiz_annual'`);
	}

	async init() {
		if (!this.client.schedule._tasks.some(t => t.id === 'clean_annual_quiz_points')) {
			this.client.schedule.create('clean_annual_quiz_points', '30 0 1 1 *', {
				data: {},
				catchUp: true,
				id: 'clean_annual_quiz_points'
			});
		}
	}

};
