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
            description: 'Affiche le top mensuel, annuel et global.',
            extendedHelp: 'No extended help available.',
            usage: '[number:int] [activity:str] [mensuel|annuel|global]',
            usageDelim: ' ',
            quotedStringSupport: false,
            subcommands: false
        });
    }

    async printTop(message, number, activity) {
        const { rowCount: activityCount, rows: activityRows } = await this.client.pg.query('SELECT * from gw2trivia.activities where ref = $1 and guild_id = $2', [activity, message.guild.id]);
        if (activityCount === 0) {
            return message.send(`L'activité ${activity} n'existe pas.`);
        }
        const { id: activityId, name: activityName } = activityRows[0];

        const { rowCount, rows } = await this.client.pg.query(`select amount, u.username || '#' || u.discriminator as tag FROM gw2trivia.scores s LEFT JOIN gw2trivia.users u ON u.id = s.user_id WHERE activity_id = $1 ORDER BY amount DESC LIMIT $2`, [activityId, number]);
        if (rowCount === 0) {
            return message.send(`Il n'y a pas de scores pour ${activityName}.`);
        }
        return message.send([`🏆 **TOP ${number} ${activityName}** 🏆`, ...rows.map(r => `**${r.amount}** - ${r.tag}`)].join('\n'));
    }

    async run(message, [number = 3, activity = 'quiz', time = 'all']) {
        if (activity === 'quiz') {
            if (['all', 'mensuel'].indexOf(time) !== -1) {
                this.printTop(message, number, 'quiz_mensual');
            }
            if (['all', 'annuel'].indexOf(time) !== -1) {
                this.printTop(message, number, 'quiz_annual');
            }
            if (['all', 'global'].indexOf(time) !== -1) {
                this.printTop(message, number, 'quiz');
            }
            return;
        }

        this.printTop(message, number, activity);
    }

    async init() {
        /*
         * You can optionally define this method which will be run when the bot starts
         * (after login, so discord data is available via this.client)
         */
    }

};
