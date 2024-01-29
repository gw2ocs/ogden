const { DateTime, Interval, Duration } = require('luxon');
const { MessageEmbed, ReactionCollector, MessageAttachment } = require('discord.js');
const { remove: diacritics } = require('diacritics');
const fetch = require('node-fetch');
const mime = require('mime');

module.exports = class {

    constructor(client, channel, question, start, duration) {
        this.client = client;
        this.channel = channel;
        this.channelDB = null;
        this.question = question;
        this.startTime = start;
        this.duration = duration;
        this.endTime = this.startTime.plus({ seconds: this.duration });
        this.points = this.question.points;
        this.showHelp = false;
        this.message = null;
        this.interval = null;
        this.winner = false;
        this.embed = null;
    }

    async start() {
        this.channelDB = await this.client.getDBChannel(this.channel);
	    console.log(`Quiz starting in channel ${JSON.stringify(this.channelDB)}`);
        const subscribersRoleId = this.channelDB.role;
        let firstMessage;
        if (subscribersRoleId && this.channel.guild.roles.cache.get(subscribersRoleId)) {
            firstMessage = await this.channel.send(`Oyez, oyez, ${this.channel.guild.roles.cache.get(subscribersRoleId)} ! Dans 30 secondes je poserai ma question. Soyez prêts !`);
        }
        setTimeout(async () => {
            this.startTime = DateTime.local();
            if (firstMessage) firstMessage.delete();
            if (subscribersRoleId && this.channel.guild.roles.cache.get(subscribersRoleId)) {
                await this.channel.send(`${this.channel.guild.roles.cache.get(subscribersRoleId)}, voici ma question :`);
            }
            this.message = await this.channel.send({ embed: this.render() });
            this.message.react('📌');
            await this.sendAttachments();
            if (subscribersRoleId && this.channel.guild.roles.cache.get(subscribersRoleId)) {
                await this.channel.send("Pour n'en rater aucune, dites `Ogden, subscribe`. Vous serez alors alerté dès que je m'apprête à poser une question.");
            }
            this.channel.awaitMessages(mess => this.test(mess), { max: 1, time: this.duration * 1000 })
                .then(async collected => {
                    const token = this.client.getJwtToken();
                    if (collected.size) {
                        this.winner = collected.first().author;
                        fetch(`${process.env.WEBSITEURL}/api/graphql`, {
                            method: "post",
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'Authorization': token ? `Bearer ${token}` : ''
                            },
                            body: JSON.stringify({
                                query: `mutation {
                                  createStat(input: {stat: {questionId: ${this.question.id}, guildSnowflake: "${this.channel.guild.id}", resolutionDuration: ${Math.round(Interval.fromDateTimes(this.startTime, DateTime.local()).toDuration(['seconds']).as('seconds'))}, userSnowflake: "${this.winner.id}", statsMessages: { create: { message: "${collected.first().content}"  } } } }) {
                                    stat { id }
                                  }
                                }`
                            })
                        }).then(response => console.log(JSON.stringify(response)));
                        setTimeout(() => collected.first().delete(), 5000);
                        this.channel.guild.settings.update('last_winner', this.winner.id, this.channel.guild);
                        try {
                            console.log(`Setting the last_winner for ${JSON.stringify(this.channelDB)} to ${this.winner.id}`);
                            if (this.channelDB) {
                                this.client.pg.query('UPDATE gw2trivia.channels set last_winner = $1 WHERE discord_id = $2', [this.winner.id, this.channelDB.discord_id]);
                                this.channelDB = await this.client.getDBChannel(this.channel);
                                console.log(`New last_winner is now ${this.channelDB.last_winner}`);
                            }
                        } catch {
                            console.error('Could not update channel');
                        }
                        const points = this.question.points;
                        this.winner.settings.update({
                            quiz_points: this.winner.settings.quiz_points + points,
                            mensual_quiz_points: this.winner.settings.mensual_quiz_points + points,
                            annual_quiz_points: this.winner.settings.annual_quiz_points + points
                        }).then(async () => {
                            const { id: userId } = await this.client.getDBUser(this.winner);
                            const activities = ['quiz', 'quiz_mensual', 'quiz_annual'];
                            const scores = {};
                            for (let i = 0, imax = activities.length ; i < imax ; i++) {
                                const { rowCount: activityCount, rows: activityRows } = await this.client.pg.query('SELECT * from gw2trivia.activities where ref = $1 and guild_id = $2', [activities[i], this.channel.guild.id]);
                                const { id: activityId, name: activityName } = activityRows[0];
				                console.log(activityName, userId, points);
                                if (activityCount !== 0) {
                                    const { rowCount: scoreCount, rows: scoreRows } = await this.client.pg.query('SELECT * FROM gw2trivia.scores where activity_id = $1 AND user_id = $2', [activityId, userId]);
                                    if (scoreCount === 0) {
                                        await this.client.pg.query('INSERT INTO gw2trivia.scores (activity_id, user_id, amount) VALUES ($1, $2, $3)', [activityId, userId, points]);
                                        scores[activities[i]] = points;
                                    } else {
                                        const current = scoreRows[0].amount;
                                        await this.client.pg.query('UPDATE gw2trivia.scores SET amount = $1 WHERE activity_id = $2 AND user_id = $3', [points + current, activityId, userId]);
                                        scores[activities[i]] = current + points;
                                    }
                                }
                            }
                            this.channel.send(`🏆 ${this.winner} a trouvé la bonne réponse et a gagné ${points} point${points !== 1 ? 's' : ''} !\n*Total : ${scores.quiz} point${scores.quiz !== 1 ? 's' : ''} (dont ${scores.quiz_mensual} ce mois-ci et ${scores.quiz_annual} cette année)*`);
                        });
                    } else {
                        this.channel.guild.settings.reset('last_winner', this.channel.guild);
                        console.log(`Resetting the last_winner for ${JSON.stringify(this.channelDB)}`);
                        if (this.channelDB) {
                            this.client.pg.query('UPDATE gw2trivia.channels set last_winner = NULL WHERE discord_id = $1', [this.channelDB.discord_id]);
                            this.channelDB = await this.client.getDBChannel(this.channel);
                            console.log(`New last_winner is now ${this.channelDB.last_winner}`);
                        }
                        fetch(`${process.env.WEBSITEURL}/api/graphql`, {
                            method: "post",
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'Authorization': token ? `Bearer ${token}` : ''
                            },
                            body: JSON.stringify({
                                query: `mutation {
                                  createStat(input: {stat: {questionId: ${this.question.id}, guildSnowflake: "${this.channel.guild.id}", resolutionDuration: ${Math.round(Interval.fromDateTimes(this.startTime, DateTime.local()).toDuration(['seconds']).as('seconds'))}}}) {
                                    stat { id }
                                  }
                                }`
                            })
                        }).then(response => console.log(JSON.stringify(response)));
                    }
                    this.stop();
                })
                .catch(this.stop);
            this.interval = setInterval(this.update.bind(this), 5000);
        }, 30000);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.message.edit({ embed: this.render() });
        }
    }

    update() {
        if (this.message) {
            this.message.edit({ embed: this.render() });
        }
    }

    render() {
        const timeLeft = Interval.fromDateTimes(DateTime.local(), this.endTime).toDuration(['hours', 'minutes', 'seconds']);
        //const description = [`Durée : ${Math.ceil(Duration.fromObject({ seconds: this.duration }).as('minutes'))}min.`];
        const description = [
            `[**${this.question.spoil && `||${this.question.title}||` || this.question.title}**](${`${process.env.WEBSITEURL}/questions/view/${this.question.id}/${this.question.slug}`})`,
            ''
        ];
        if (!this.embed) {
            this.embed = new MessageEmbed()
                .setColor(0xc7c7c7)
                //.setTitle(this.question.spoil && `||${this.question.title}||` || this.question.title)
                //.setURL(`https://gw2trivia.com/questions/view/${this.question.id}/${this.question.slug}`)
                //.setAuthor(this.question.title, false, `https://gw2trivia.com/questions/view/${this.question.fullSlug}`)
                .setFooter(`${this.points} point${this.points !== 1 ? 's' : ''} | Fini à`)
                .setTimestamp(this.endTime.toJSDate());
                if (this.question.user) {
                    this.embed.setAuthor(this.question.user.username, this.question.user.avatarUrl, `${process.env.WEBSITEURL}/questions?user_id=${this.question.user.id}`);
                }
                if (this.question.categories.length) {
                    this.embed.addField('Catégories', this.question.categories.map(c => c.name).join(', '), false);
                }
                this.embed.addField('Ajoutée le', DateTime.fromISO(this.question.created).toISODate(), true);
                this.embed.addField('Durée', `${Math.ceil(Duration.fromObject({ seconds: this.duration }).as('minutes'))}min.`, true);
        }
        /*if (this.question.user) {
            description.push(`Auteur : ${this.question.user.username}#${this.question.user.discriminator}`);
        }
        if (this.question.created) {
            description.push(`Ajoutée le ${DateTime.fromISO(this.question.created).toISODate()}`);
        }*/
        if (!timeLeft.isValid || timeLeft.as('seconds') < 0 || this.winner) {
            description.push('**Fini !**');
            if (this.winner) {
                this.embed.setColor(0xffd700);
                this.embed.addField('Temps de résolution', `${Interval.fromDateTimes(this.startTime, DateTime.local()).toDuration(['seconds']).as('seconds')}s`, true);
                this.embed.addField('Gagnant', `${this.winner} 🏆`, true);
            } else {
                this.embed.setColor(0x808080);
                description.push('*Personne n\'a trouvé...*');
            }
        } else {
            description.push(`Temps restant : **${timeLeft.hours || '00'}:${timeLeft.minutes || '00'}:${Math.floor(timeLeft.seconds) || '00'}** ⏰`);
        }
        if (this.question.tips.length && timeLeft.as('seconds') < this.duration / 2) {
            description.push('Indices :');
            description.push(...this.question.tips.map(tip => ` - ||${tip.content}||`));
        }
        return this.embed
            .setDescription(description.join('\n'));
    }

    async sendAttachments() {
        return Promise.all(this.question.images.map(image => this.channel.send(new MessageAttachment(`${process.env.WEBSITEURL}/assets/img/${image.id}`, `${image.id}.${mime.getExtension(image.type)}`))));
    }

    test(message) {
        if (message.author.bot) return false;
        if (message.author.id === this.channelDB.last_winner) {
            const timeLeft = Interval.fromDateTimes(DateTime.local(), this.endTime).toDuration(['hours', 'minutes', 'seconds']);
            if (timeLeft.as('seconds') >= this.duration * 3 / 4) {
                const remaining = timeLeft.minus({ seconds: this.duration * 3 / 4});
                message.react('🕛');
                message.reply(`laissez les autres tenter leur chance, voyons ! Retentez dans ${remaining.as('seconds') >= 60 ? `${Math.ceil(remaining.as('minutes'))} minutes` : `${Math.ceil(remaining.as('seconds'))} secondes`}.\nVoulez-vous supprimer votre message ?`)
                    .then(msg => {
                            const collector = new ReactionCollector(msg, (reaction, user) => ['✅', '❎'].includes(reaction.emoji.name) && user === message.author, { max: 1, time: 300000 });
                            collector.on('collect', (reaction, user) => {
                                if (reaction.emoji.name === '✅' && !message.deleted) {
                                    message.delete();
                                }
                            });
			                return msg;
                        })
                    .then(msg => msg.react('✅').then(() => msg.react('❎')));
                return false;
            }
        }
        const text = message.content;
        return this.question.answers
            .some(ans => ans.content.split(/\s*;\s*/)
                .every(str => RegExp(diacritics(str.trim()).replace(/ /g, '.*').replace(/[’'-]/g, '.').replace(/\b(\d+)\b/g, '\\b$1\\b'), "gi")
                    .test(diacritics(text).replace(/-/g, ' '))));
    }

};
