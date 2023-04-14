const { Command } = require('klasa');
const fetch = require('node-fetch');

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
            permissionLevel: 7,
            description: '',
            extendedHelp: 'No extended help available.',
            usage: '',
            usageDelim: undefined,
            quotedStringSupport: false,
            subcommands: false
        });
    }

    async run(msg) {
        msg.guild.members.cache.filter(m => m.user.settings.quiz_points !== 0)
        .forEach(async m => {
            const { id: userId } = await this.client.getDBUser(m.user);
            /* quiz_points: this.winner.settings.quiz_points + points,
                            mensual_quiz_points: this.winner.settings.mensual_quiz_points + points,
                            annual_quiz_points: this.winner.settings.annual_quiz_points + points
                            */
            const activities = ['quiz', 'quiz_mensual', 'quiz_annual'];
            const points_name = ['quiz_points', 'mensual_quiz_points', 'annual_quiz_points'];
            for (let i = 0, imax = activities.length ; i < imax ; i++) {
                const points = m.user.settings[points_name[i]];
                const { rowCount: activityCount, rows: activityRows } = await this.client.pg.query('SELECT * from gw2trivia.activities where ref = $1 and guild_id = $2', [activities[i], msg.channel.guild.id]);
                const { id: activityId, name: activityName } = activityRows[0];
console.log(activityName, userId, points);
                if (activityCount !== 0) {
                    const { rowCount: scoreCount, rows: scoreRows } = await this.client.pg.query('SELECT * FROM gw2trivia.scores where activity_id = $1 AND user_id = $2', [activityId, userId]);
                    if (scoreCount === 0) {
                        await this.client.pg.query('INSERT INTO gw2trivia.scores (activity_id, user_id, amount) VALUES ($1, $2, $3)', [activityId, userId, points]);
                    } else {
                        await this.client.pg.query('UPDATE gw2trivia.scores SET amount = $1 WHERE activity_id = $2 AND user_id = $3', [points, activityId, userId]);
                    }
                }
            }
        });
    }

    async init() {
        /*
         * You can optionally define this method which will be run when the bot starts
         * (after login, so discord data is available via this.client)
         */
    }

};
