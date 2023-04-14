const { Task } = require('klasa');
const { DateTime } = require('luxon');

module.exports = class extends Task {

	constructor(...args) {
		/**
		 * Any default options can be omitted completely.
		 * if all options are default, you can omit the constructor completely
		 */
		super(...args, { enabled: true });
	}

	async run({ guild }) {
		const _guild = this.client.guilds.cache.get(guild);
		if (!_guild || !_guild.settings.cleanup.auto) return;
		const channel = _guild.channels.cache.get(_guild.settings.channels.quiz);
		await channel.send('Nettoyage du salon dans 5 minutes. Les messages épinglés ou avec :pushpin: en réaction ne seront pas supprimés.');
		setTimeout(() => {
			channel.send('Nettoyage en cours...').then(() => channel.messages.fetch()
				.then(messages => messages.filter(m => !m.pinned && !m.reactions.resolve('📌'))
					.each(m => m.delete())));
		}, 300000);
	}

	async init() {
		/*
		 * You can optionally define this method which will be run when the bot starts
		 * (after login, so discord data is available via this.client)
		 */
	}

};
