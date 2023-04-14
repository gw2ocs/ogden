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
            botPerms: [],
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
            permissionLevel: 3,
            description: '',
            extendedHelp: 'No extended help available.',
            usage: '<start|stop>',
            usageDelim: ' ',
            quotedStringSupport: false,
            subcommands: false
        });
    }

    async run(msg, [action]) {
        msg.guild.settings.update('cleanup.auto', action === 'start', msg.guild);
        if (this.client.schedule.get(`${msg.guild.id}_cleanup`)) {
            this.client.schedule.delete(`${msg.guild.id}_cleanup`);
        }
        if (action === 'start') {
            this.client.schedule.create('cleanup', msg.guild.settings.cleanup.cron, {
                data: {
                    guild: msg.guild.id
                },
                catchUp: false,
                id: `${msg.guild.id}_cleanup`
            });
        }
    }

    async init() {
        /*
         * You can optionally define this method which will be run when the bot starts
         * (after login, so discord data is available via this.client)
         */
    }

};
