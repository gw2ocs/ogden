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
            botPerms: ['VIEW_CHANNEL', 'MANAGE_MESSAGES', 'SEND_MESSAGES'],
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
            usageDelim: null,
            quotedStringSupport: false,
            subcommands: false
        });
    }

    async run(msg) {
        const toDelete = [];

        // Language
        const availableLanguages = Array.from(this.client.languages.keys());
        toDelete.push(await msg.channel.send(`What language do you want to use ? [${availableLanguages.join(', ')}]\nCurrently: ${msg.guild.settings.language}`));
        const collectedLocale = await msg.channel.awaitMessages(mess => mess.author === msg.author, { max: 1, time: 120000 });
        if (!collectedLocale.size) return msg.channel.send('Timeout');
        const locale = collectedLocale.first().content;
        toDelete.push(collectedLocale.first());
        if (availableLanguages.includes(locale)) {
            msg.guild.settings.update('language', locale, msg.guild);
        } else {
            toDelete.push(await msg.channel.send('Choice not in selection. Skipping.'));
        }

        // Channel
        const currentChannel = msg.guild.settings.channels.quiz;
        toDelete.push(await msg.channel.send(`Which channel should I post my quiz in ?\n${currentChannel ? `Currently: ${msg.guild.channels.cache.get(currentChannel)}` : 'None set yet.'}`));
        const collectedChannel = await msg.channel.awaitMessages(mess => mess.author === msg.author, { max: 1, time: 120000 });
        if (!collectedChannel.size) return msg.channel.send('Timeout');
        let channel = collectedChannel.first();
        toDelete.push(channel);
        channel = channel.mentions.channels.first();
        if (channel) {
            msg.guild.settings.update('channels.quiz', channel.id, msg.guild);
        } else {
            toDelete.push(await msg.channel.send('Not a channel. Skipping.'));
        }

        // Default duration
        toDelete.push(await msg.channel.send(`What should be the default duration of a quiz ?\nCurrently: ${msg.guild.settings.config.default_duration}s.`));
        const collectedDuration = await msg.channel.awaitMessages(mess => mess.author === msg.author, { max: 1, time: 120000 });
        if (!collectedDuration.size) return msg.channel.send('Timeout');
        const duration = collectedDuration.first().content;
        toDelete.push(collectedDuration.first());
        if (/\d+/.test(duration)) {
            msg.guild.settings.update('config.default_duration', Number(/(\d+)/.exec(duration)[1]), msg.guild);
        } else {
            toDelete.push(await msg.channel.send('Not a number. Skipping.'));
        }

        // Auto
        toDelete.push(await msg.channel.send(`Should I automatically post my questions ? [Y, N]\nCurrently: ${msg.guild.settings.config.auto ? 'Y' : 'N'}.`));
        const collectedAuto = await msg.channel.awaitMessages(mess => mess.author === msg.author, { max: 1, time: 120000 });
        if (!collectedAuto.size) return msg.channel.send('Timeout');
        let auto = collectedAuto.first().content;
        toDelete.push(collectedAuto.first());
        if (/[yn]/i.test(auto)) {
            auto = /y/i.test(auto);
            if (this.client.schedule.get(msg.guild.id)) {
                this.client.schedule.delete(msg.guild.id);
            }
            msg.guild.settings.update('config.auto', auto, msg.guild);
            if (auto) {
                this.client.schedule.create('quiz', msg.guild.settings.config.cron, {
                    data: {
                        guild: msg.guild.id
                    },
                    catchUp: true,
                    id: msg.guild.id
                });
            }
        } else {
            toDelete.push(await msg.channel.send('Not valid. Skipping.'));
        }

        // Cleaning
        for (let i = 0, ilen = toDelete.length ; i < ilen ; i++) {
            toDelete[i].delete();
        }
        msg.delete();
    }

    async init() {
        /*
         * You can optionally define this method which will be run when the bot starts
         * (after login, so discord data is available via this.client)
         */
    }

};
