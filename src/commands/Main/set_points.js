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
            permissionLevel: 3,
            description: '',
            extendedHelp: 'No extended help available.',
            usage: '<user:user> <points:int> [activity:str]',
            usageDelim: ' ',
            quotedStringSupport: false,
            subcommands: false
        });
    }

    async run(message, [user, points, activity = 'quiz']) {
        if (activity === 'quiz') {
            const current = user.settings.quiz_points;
            await user.settings.update('quiz_points', points).then(() => message.react('✅'));
            return message.send(`${user} est passé de ${current} à ${user.settings.quiz_points} points.`);
        }

        
    }

    async init() {
        /*
         * You can optionally define this method which will be run when the bot starts
         * (after login, so discord data is available via this.client)
         */
    }

};
