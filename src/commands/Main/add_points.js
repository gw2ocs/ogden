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
            await user.settings.update('quiz_points', current + points).then(() => message.react('✅'));
            return message.send(`${user} est passé de ${current} à ${user.settings.quiz_points} points.`);
        }

        const { rowCount: activityCount, rows: activityRows } = await this.client.pg.query('SELECT * from gw2trivia.activities where ref = $1 and guild_id = $2', [activity, message.guild.id]);
        if (activityCount === 0) {
            return message.send(`L'activité ${activity} n'existe pas.`);
        }
        const { id: activityId, name: activityName } = activityRows[0];
        
        const { id: userId } = await this.client.getDBUser(user);

        const { rowCount: scoreCount, rows: scoreRows } = await this.client.pg.query('SELECT * FROM gw2trivia.scores where activity_id = $1 AND user_id = $2', [activityId, userId]);
        if (scoreCount === 0) {
            await this.client.pg.query('INSERT INTO gw2trivia.scores (activity_id, user_id, amount) VALUES ($1, $2, $3)', [activityId, userId, points]);
            return message.send(`${user} est passé de 0 à ${points} points pour ${activityName}.`);
        } else {
            const current = scoreRows[0].amount;
            await this.client.pg.query('UPDATE gw2trivia.scores SET amount = $1 WHERE activity_id = $2 AND user_id = $3', [points + current, activityId, userId]);
            return message.send(`${user} est passé de ${current} à ${current + points} points pour ${activityName}.`);
        }
    }

    async init() {
        /*
         * You can optionally define this method which will be run when the bot starts
         * (after login, so discord data is available via this.client)
         */
    }

};
