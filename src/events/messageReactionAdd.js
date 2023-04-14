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

	async run(messageReaction, user) {
		// This is where you place the code you want to run for your event
		if (messageReaction.message.id === '759110198073360394') {
			let role = false;
			switch (messageReaction.emoji.id) {
				case '674186730332487680':
					role = '681241987696951447';
					break;
				case '674186728701034529':
					role = '745014431234129961';
					break;
				case '674186724196352040':
					role = '916807370699587654';
					break;
			}
			role = messageReaction.message.guild.roles.resolve(role);
			if (role) {
				messageReaction.message.guild.members.fetch(user).then(u => u.roles.add(role));
			}
		}
	}

	async init() {
		/*
		 * You can optionally define this method which will be run when the bot starts
		 * (after login, so discord data is available via this.client)
		 */
		this.client.channels.fetch('682309267960889362').then(channel => channel.messages.fetch('759110198073360394'));
	}

};
