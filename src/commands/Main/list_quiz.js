const { Command } = require('klasa');
const fetch = require('node-fetch');

module.exports = class extends Command {

    constructor(...args) {
        /**
         * Any default options can be omitted completely.
         * if all options are default, you can omit the constructor completely
         */
        super(...args, {
            enabled: false,
            runIn: ['text', 'dm', 'group'],
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
            usage: '[last]',
            usageDelim: undefined,
            quotedStringSupport: false,
            subcommands: false
        });
    }

    async run(msg, [last]) {
        const { questions } = await fetch(`http://ogden.gw2ocs.com/api/questions.json${last ? '?sort=created&direction=desc' : ''}`).then(r => r.json());
        //const questions = this.client.gateways.questions.cache;
        return msg.send(questions.map(q => `[${q.id}] ${q.title} - **${q.points}**`).join('\n'), { split: { char: '\n' } });
    }

    async init() {
        /*
         * You can optionally define this method which will be run when the bot starts
         * (after login, so discord data is available via this.client)
         */
    }

};
