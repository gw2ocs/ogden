const { Client } = require('klasa');
const { config, token, api } = require('./config');
const jwt = require('jsonwebtoken');
const pg = require('pg');

Client.defaultPermissionLevels
	.add(3, ({guild, author, member}) => guild &&
		(guild.settings.permissions.managers.users.includes(author.id) ||
			guild.settings.permissions.managers.role && member.roles.cache.has(guild.settings.permissions.managers.role)), { fetch: true });

class Ogden extends Client {

	getJwtToken() {
		return jwt.sign({ aud: 'postgraphile', role: 'gw2trivia_user', user_id: process.env.APIID  }, process.env.JWTSECRET);
	}

	updateActivity() {
		const today = new Date();
		const day = today.getDay();
		let activity = '';
		switch (day) {
			case 0:
				// sunday
				activity = 'Bagarre de barils';
				break;
			case 1:
			case 4:
				// monday and thursday
				activity = 'Lancer de crabe';
				break;
			case 2:
			case 5:
				// tuesday and friday
				activity = 'Course du Sanctuaire';
				break;
			case 3:
			case 6:
				// wednesday and saturday
				activity = 'Survie à Sud-Soleil';
		}
		this.user.setActivity(activity, { type: 'WATCHING' })
			.catch(console.error);
	}

	updateServerAvatar() {
		const today = new Date();
		const day = today.getDate();
		const month = today.getMonth();
		const guild = this.guilds.resolve('656508733412605962');

		//if (!guild.available) return;

		const { quaggans } = Ogden.assets;
		const current = guild.settings.last_icon;
		let url = quaggans.baby;
		switch (month) {
			case 0:
				if (day === 1) url = quaggans.party;
				else url = quaggans.hood_up;
				break;
			case 1:
				if (day === 2) url = quaggans.pancake;
				else if (day === 14) url = quaggans.girly;
				else url = quaggans.hood_down;
				break;
			case 6:
				url = quaggans.relax;
				break;
			case 7:
				url = quaggans.bowl;
				break;
			case 9:
				if (day >= 15) url = quaggans.ghost;
				else url = quaggans.hood_down;
				break;
			case 10:
				url = quaggans.hood_up;
				break;
			case 11:
				if (day === 24) url = quaggans.present;
				else if (day === 31) url = quaggans.party;
				else url = quaggans.christmas;
				break;
		}
		console.log({day, month, url});
		if (current !== url) guild.setIcon(url).catch(console.error);
	}

	async getDBClient(client) {
		const { user: { id: discordId, name } } = client;
		let { rowCount, rows } = await this.pg.query(`SELECT * FROM gw2trivia.clients WHERE discord_id = '${discordId}'`);
        if (rowCount === 0) {
            ({ rowCount, rows } = await this.pg.query(`INSERT INTO gw2trivia.clients (discord_id, name)
            VALUES ($1, $2) RETURNING *`, [discordId, name]));
        }
        return rows[0];
	}

	async getDBUser(user) {
		const { id: discordId, username, discriminator, avatar } = user;
		let { rowCount, rows } = await this.pg.query(`SELECT * FROM gw2trivia.users WHERE discord_id = '${discordId}'`);
        if (rowCount === 0) {
            ({ rowCount, rows } = await this.pg.query(`INSERT INTO gw2trivia.users (username, discord_id, discriminator, avatar, locale)
            VALUES ($1, $2, $3, $4, $5) RETURNING *`, [username, discordId, discriminator, avatar, 'fr']));
        }
        return rows[0];
	}

	async getDBGuild(guild) {
		const { id: discordId, name, icon, description, ownerID } = guild;
		let { rowCount, rows } = await this.pg.query(`SELECT * FROM gw2trivia.guilds WHERE discord_id = '${discordId}'`);
        if (rowCount === 0) {
            ({ rowCount, rows } = await this.pg.query(`INSERT INTO gw2trivia.guilds (discord_id, name, icon, description, owner_id)
            VALUES ($1, $2, $3, $4, $5) RETURNING *`, [discordId, name, icon, description, ownerID]));
        }
        return rows[0];
	}

	async getDBChannel(channel) {
		const { id: discordId, guild: { id: guildId } } = channel;
		let { rowCount, rows } = await this.pg.query(`SELECT * FROM gw2trivia.channels WHERE discord_id = '${discordId}'`);
        if (rowCount === 0) {
            ({ rowCount, rows } = await this.pg.query(`INSERT INTO gw2trivia.channels (discord_id, guild_id)
            VALUES ($1, $2) RETURNING *`, [discordId, guildId]));
        }
        return rows[0];
	}

	async checkDBUser(user) {
		const { id: discordId } = user;
		const { rowCount } = await this.pg.query(`SELECT * FROM gw2trivia.users WHERE discord_id = '${discordId}'`);
        return rowCount !== 0;
	}

	async checkDBGuild(guild) {
		const { id: discordId } = guild;
		const { rowCount } = await this.pg.query(`SELECT * FROM gw2trivia.guilds WHERE discord_id = '${discordId}'`);
        return rowCount !== 0;
	}

	async checkDBChannel(channel) {
		const { id: discordId } = channel;
		const { rowCount } = await this.pg.query(`SELECT * FROM gw2trivia.channels WHERE discord_id = '${discordId}'`);
        return rowCount !== 0;
	}

}

Ogden.assets = {
	quaggans: {
		baby: 'https://gw2trivia.com/img/quaggans/Pooba...baby_quaggan_icon.png',
		party: 'https://gw2trivia.com/img/quaggans/Party_time_quaggan_icon.png',
		birthday: 'https://gw2trivia.com/img/quaggans/Birthday_icon.png',
		pancake: 'https://gw2trivia.com/img/quaggans/Pancakes_quaggan_icon.png',
		girly: 'https://gw2trivia.com/img/quaggans/Girly_quaggan_icon.png',
		relax: 'https://gw2trivia.com/img/quaggans/Relax_quaggan_icon.png',
		bowl: 'https://gw2trivia.com/img/quaggans/Bowl_quaggan_icon.png',
		present: 'https://gw2trivia.com/img/quaggans/Present_quaggan_icon.png',
		christmas: 'https://gw2trivia.com/img/quaggans/Seasons_greetings_quaggan_icon.png',
		hood_down: 'https://gw2trivia.com/img/quaggans/Hood_down_quaggan_icon.png',
		hood_up: 'https://gw2trivia.com/img/quaggans/Hood_up_quaggan_icon.png',
		outfit: 'https://gw2trivia.com/img/quaggans/Outfit_quaggan_icon.png',
		helmet: 'https://gw2trivia.com/img/quaggans/Helmet_quaggan_icon.png',
		ghost: 'https://gw2trivia.com/img/quaggans/Ghost_quaggan_icon.png',
	},
	activities: {
		activities: 'https://wiki.guildwars2.com/images/c/ca/Activities.png',
		barBrawl: 'https://wiki.guildwars2.com/images/d/d0/Bar_Brawl_%28achievements%29.png',
		belchersBluff: 'https://wiki.guildwars2.com/images/5/5e/Belcher%27s_Bluff_%28achievements%29.png'
	}
}

Ogden.defaultClientSchema
	.add('last_question_cursor', 'String', { configurable: false })
	.add('last_achievement_cursor', 'String', { configurable: false })
	.add('last_article_cursor', 'String', { configurable: false });

Ogden.defaultGuildSchema
	.add('channels', folder => folder
		.add('bot', 'TextChannel')
		.add('quiz', 'TextChannel')
		.add('new_quiz', 'TextChannel')
		.add('news', 'TextChannel'))
	.add('key_users', folder => folder
		.add('managers', 'User', { array: true }))
	.add('questions_todo', 'String', { array: true })
	.add('config', folder => folder
		.add('auto', 'Boolean', { default: false })
		.add('cron', 'String', { default: '0 */2 * * *'})
		.add('default_duration', 'Integer', { default: 1200 }))
	.add('cleanup', folder => folder
		.add('auto', 'Boolean', { default: true })
		.add('cron', 'String', { default: '45 1-23/2 * * *'}))
	.add('last_winner', 'User')
	.add('last_icon', 'String')
	.add('permissions', folder => folder
		.add('managers', folder => folder
			.add('role', 'Role')
			.add('users', 'User', { array: true }))
		.add('subscribers', 'Role')
		.add('new_players', 'Role')
		.add('monthly_winner', 'Role')
		.add('monthly_contributor', 'Role'));

Ogden.defaultUserSchema
	.add('points', folder => folder
		.add('total', 'Integer', { default: 0, configurable: false })
		.add('mensual', 'Integer', { default: 0, configurable: false })
		.add('annual', 'Integer', { default: 0, configurable: false }))
	.add('quiz_points', 'Integer', { default: 0, configurable: false })
	.add('mensual_quiz_points', 'Integer', { default: 0, configurable: false })
	.add('annual_quiz_points', 'Integer', { default: 0, configurable: false });

const client = new Ogden(config);

client.gateways.register('questions', {
	title: { type: 'string'	},
	answers: { type: 'string', array: true },
	tips: { type: 'string', array: true },
	points: { type: 'integer', default: 1 }
});

client.pg = new pg.Client();
client.pg.connect();

client.login(token)
	.then(() => {
		client.updateActivity();
		client.updateServerAvatar();
	});
