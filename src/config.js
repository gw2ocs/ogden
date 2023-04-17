/**
 * The following are all client options for Klasa/Discord.js.
 * Any option that you wish to use the default value can be removed from this file.
 * This file is init with defaults from both Klasa and Discord.js.
 */

exports.config = {
	/**
	 * General Options
	 */
	// Disables/Enables a process.on('unhandledRejection'...) handler
	production: false,
	// The default language that comes with klasa. More base languages can be found on Klasa-Pieces
	language: 'en-US',
	// The default configurable prefix for each guild
	prefix: 'Ogden, ',
	// Any Websocket Events you don't want to listen to
	disabledEvents: [
		'GUILD_MEMBER_ADD',
		//'GUILD_MEMBER_REMOVE',
		'GUILD_MEMBER_UPDATE',
		'GUILD_MEMBERS_CHUNK',
		'GUILD_INTEGRATIONS_UPDATE',
		'GUILD_ROLE_CREATE',
		'GUILD_ROLE_DELETE',
		'GUILD_ROLE_UPDATE',
		'GUILD_BAN_ADD',
		'GUILD_BAN_REMOVE',
		'CHANNEL_CREATE',
		'CHANNEL_DELETE',
		'CHANNEL_UPDATE',
		'CHANNEL_PINS_UPDATE',
		'PRESENCE_UPDATE',
		'VOICE_STATE_UPDATE',
		'TYPING_START',
		'VOICE_STATE_UPDATE',
		'VOICE_SERVER_UPDATE',
		'WEBHOOKS_UPDATE'
	],
	//ws: { intents: [/*'GUILD_PRESENCES',*/ 'GUILD_MEMBERS'] },
	// A once ready message for your console
	readyMessage: (client) => `Successfully initialized. Ready to serve ${client.guilds.cache.size} guild${client.guilds.cache.size === 1 ? '' : 's'}.`,

	/**
	 * Command Handler Options
	 */
	commandEditing: true,
	commandLogging: true,
	typing: true,

	/**
	 * Database Options
	 */
	providers: {
		default: 'json'
	},

	/**
	 * Console Event Handlers (enabled/disabled)
	 */
	consoleEvents: {
		debug: false,
		error: true,
		log: true,
		verbose: true,
		warn: true,
		wtf: true
	},

	/**
	 * Console Options
	 */
	console: {
		// Alternatively a Moment Timestamp string can be provided to customize the timestamps.
		timestamps: true,
		utc: false,
		colors: {
			debug: { time: { background: 'magenta' } },
			error: { time: { background: 'red' } },
			log: { time: { background: 'blue' } },
			verbose: { time: { text: 'gray' } },
			warn: { time: { background: 'lightyellow', text: 'black' } },
			wtf: { message: { text: 'red' }, time: { background: 'red' } }
		}
	},

	/**
	 * Custom Setting Gateway Options
	 */
	gateways: {
		guilds: {},
		users: {},
		clientStorage: {}
	},
};

// The token for this bot to login with
exports.token = process.env.DISCORDTOKEN;
