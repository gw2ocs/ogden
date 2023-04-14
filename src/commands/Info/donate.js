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
            description: 'Obtenez des informations sur la façon d\'aider Ogden dans ses projets.',
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
				`Le projet de Questions pour un Quaggan a commencé en 2018 et n'était, à l'origine, qu'un bot avec quelques questions. Depuis, le projet a bien évolué et comprend maintenant le site <https://gw2trivia.com>, de nombreux articles sur le lore et plus de 1000 questions`,
                '',
                `Cependant, tout n'est pas gratuit et nous avons besoin de votre aide pour garder Ogden en vie.`,
                `Nous serons très reconnaissants si vous nous aidez.`,
                `Nous avons travaillé sur beaucoup de choses et d'autres sont encore à venir. Ogden nous est précieux. Prenez soin de lui.`,
                '',
                `Vous souhaitez soutenir ce projet ? N'hésitez pas à le faire ! https://paypal.me/pandraghon`,
                `Plus d'informations sur https://gw2trivia.com/about/support`
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
