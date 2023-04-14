const { Event } = require('klasa');

module.exports = class extends Event {

	constructor(...args) {
		/**
		 * Any default options can be omitted completely.
		 * if all options are default, you can omit the constructor completely
		 */
		super(...args, {
			enabled: true,
			once: false
		});
	}

	async run(member) {
		// This is where you place the code you want to run for your event
		const { guild } = member;
        const role_id = guild.settings.permissions.new_players;
        if (!role_id) return;
        // fetch the role
        const role = guild.roles.resolve(role_id);
        if (!role) return;
		member.roles.add(role);
	}

	async init() {
		/*
		 * You can optionally define this method which will be run when the bot starts
		 * (after login, so discord data is available via this.client)
		 */
	}

};
