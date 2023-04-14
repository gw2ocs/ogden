const { Command } = require('klasa');

module.exports = class extends Command {

    constructor(...args) {
        /**
         * Any default options can be omitted completely.
         * if all options are default, you can omit the constructor completely
         */
        super(...args, {
            enabled: true,
            runIn: ['text'],
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
            description: 'Retire le rôle pour ne plus être notifié lorsqu\'une question est posée.',
            extendedHelp: 'No extended help available.',
            usage: '',
            usageDelim: undefined,
            quotedStringSupport: false,
            subcommands: false
        });
    }

    async run(message) {
        if (!await this.client.checkDBChannel(message.channel)) {
            return message.channel.send('Le rôle n\'a pas été défini pour ce salon. Voyez ça avec l\'administrateur du serveur.');
        }
        const channelDB = await this.client.getDBChannel(message.channel);
        
        if (!channelDB.role || !message.guild.roles.cache.get(channelDB.role)) {
            return message.channel.send('Le rôle n\'a pas été défini pour ce salon. Voyez ça avec l\'administrateur du serveur.');
        }
        return message.member.roles.remove(channelDB.role).then(() => message.react('✅'));
    }

    async init() {
        /*
         * You can optionally define this method which will be run when the bot starts
         * (after login, so discord data is available via this.client)
         */
    }

};
