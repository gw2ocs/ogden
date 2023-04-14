const { Command } = require('klasa');

module.exports = class extends Command {

    constructor(...args) {
        /**
         * Any default options can be omitted completely.
         * if all options are default, you can omit the constructor completely
         */
        super(...args, {
            enabled: true,
            runIn: ['text', 'dm', 'group'],
            requiredPermissions: [],
            requiredSettings: [],
            aliases: [],
            autoAliases: true,
            bucket: 1,
            cooldown: 0,
            promptLimit: 0,
            promptTime: 30000,
            deletable: false,
            guarded: false,
            nsfw: false,
            permissionLevel: 0,
            description: 'Affiche sonn profil.',
            extendedHelp: 'No extended help available.',
            usage: '',
            usageDelim: undefined,
            quotedStringSupport: false,
            subcommands: false
        });
    }

    async run(message, [...params]) {
        const { id: userId, username, discriminator, avatar } = message.author;
		let { rowCount, rows } = await this.client.pg.query(`SELECT * FROM gw2trivia.users WHERE discord_id = '${userId}'`);
        if (rowCount === 0) {
            ({ rowCount, rows } = await this.client.pg.query(`INSERT INTO gw2trivia.users (username, discord_id, discriminator, avatar, locale)
            VALUES ($1, $2, $3, $4, $5) RETURNING *`, [username, userId, discriminator, avatar, 'fr']));
        }
        console.log(rows);
        return message.send(`Le profil de ${username} est accessible en suivant ce lien : https://gw2trivia.com/users/view/${rows[0].id}`);
    }

    async init() {
        /*
         * You can optionally define this method which will be run when the bot starts
         * (after login, so discord data is available via this.client)
         */
    }

};
