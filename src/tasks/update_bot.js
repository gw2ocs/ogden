const { Task } = require('klasa');

module.exports = class extends Task {

	constructor(...args) {
		super(...args, { enabled: true });
	}

	async run(metadata) {
		this.client.updateActivity();
		this.client.updateServerAvatar();
	}

	async init() {
		if (!this.client.schedule._tasks.some(t => t.id === 'update_bot')) {
			this.client.schedule.create('update_bot', '0 0 * * *', {
				data: {},
				catchUp: true,
				id: 'update_bot'
			});
		}
	}

};
