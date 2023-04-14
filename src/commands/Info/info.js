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
            description: 'Présentation du bot',
            extendedHelp: 'No extended help available.',
            usage: '',
            usageDelim: undefined,
            quotedStringSupport: false,
            subcommands: false
        });
    }

    async run(message, [...params]) {
        return message.send(
            [
				'Je suis Ogden Guéripierre, le dernier des Nains.',
				"Comme mon travail au Prieuré me laisse beaucoup de temps libre, j'ai décidé de mettre à l'épreuve les aventuriers.",
				"Ainsi donc, pour m'assurer que l'histoire de la Tyrie ne soit pas oubliée, je pose des questions sur le passé, le présent et diverses choses.",
				'',
				"Si vous souhaitez ne manquer aucune question, vous pouvez vous abonner en écrivant `Ogden, subscribe`. Vous serez ainsi notifié lorsque je m'apprète à poser ma question.",
				"Pour plus d'informations, rendez-vous sur <https://gw2trivia.com>."
			].join('\n')
        );
    }

    async init() {
        /*
         * You can optionally define this method which will be run when the bot starts
         * (after login, so discord data is available via this.client)
         */
    }

};
