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
        const { guild } = msg;
        const role_id = guild.settings.permissions.new_players;
        if (!role_id) return;
        // fetch the role
        const role = guild.roles.resolve(role_id);
        if (!role) return;
        const members = (await guild.members.fetch()).array();
        for (let m = 0, mmax = members.length ; m < mmax ; m++) {
            const member = members[m];
            console.log(member);
            console.log(member.user);
            if (await this.client.checkDBUser(member.user)) {
                const { id: userId } = await this.client.getDBUser(member.user);
                const { rowCount: activityCount, rows: activityRows } = await this.client.pg.query('SELECT * from gw2trivia.activities where ref = $1 and guild_id = $2', ['quiz', guild.id]);
                const { id: activityId, name: activityName } = activityRows[0];
                if (activityCount !== 0) {
                    const { rowCount: scoreCount, rows: scoreRows } = await this.client.pg.query('SELECT * FROM gw2trivia.scores where activity_id = $1 AND user_id = $2', [activityId, userId]);
                    if (scoreCount && scoreRows[0].amount > 100) {
                        // Remove new_players role
                        member.roles.remove(role);
                        continue;
                    }
                }
            }
            // Add new_players role
            member.roles.add(role);
        }
    }

    async init() {
        /*
         * You can optionally define this method which will be run when the bot starts
         * (after login, so discord data is available via this.client)
         */
    }

};
