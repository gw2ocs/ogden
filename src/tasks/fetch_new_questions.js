const { Task } = require('klasa');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = class extends Task {

	constructor(...args) {
		super(...args, { enabled: true });
	}

	async post_new_question(guild, channel, question) {
		let title = question.title;
		if (question.spoil && question.title.length > 252 || question.title.length > 256) {
			title = question.spoil ? question.title.slice(0, 249) : question.title.slice(0, 253);
			title = `${title}...`;
		}
		const embed = new MessageEmbed()
			.setColor(0x00c7ff)
			.setAuthor(question.userByUserId.username, question.userByUserId.avatarUrl, `${process.env.WEBSITEURL}/questions?user_id=${question.userByUserId.id}`)
			.setTimestamp(new Date(question.createdAt))
			.setTitle(question.spoil ? `||${title}||` : title)
			.setURL(`${process.env.WEBSITEURL}/questions/view/${question.id}/${question.slug}`)
			.addField('Points', question.points, true)
			.addField('Auteur', `<@${question.userByUserId.discordId}>`, true);
		if (question.categories.nodes.length) {
			embed.addField('Categories', question.categories.nodes.map(q => q.name).join(', '));
		}
		if (question.spoil) {
			embed.setDescription('**Risque de spoil !**');
		}
		channel.send({ embed });
	}

	async run(metadata) {
		const guilds = [...this.client.guilds.cache.values()];
		for (let i = 0, imax = guilds.length ; i < imax ; i++) {
			const guild = guilds[i];
			const last_cursor = this.client.settings.last_question_cursor;
			const news_channel = guild.channels.resolve(guild.settings.channels.news);
			if (!news_channel) continue;
			const query = `{
						allQuestions${last_cursor && `(after: ${JSON.stringify(last_cursor)})` || ''} {
							nodes {
								userByUserId { id discordId username discriminator avatarUrl }
								categories { nodes { name } }
								points slug title id createdAt spoil
							}
							pageInfo { endCursor }
						}
                    }`;
			fetch(`${process.env.WEBSITEURL}/api/graphql}`, {
                method: "post",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query })
            })
                .then(response => response.json())
                .then(async response => {
				if (response.data.allQuestions.pageInfo.endCursor) {
					this.client.settings.update('last_question_cursor', response.data.allQuestions.pageInfo.endCursor);
					this.client.settings.sync();
				}
				if (response.data.allQuestions.nodes.length > 1) {
					await news_channel.send(`${response.data.allQuestions.nodes.length} nouvelles questions ont été postées sur <https://gw2trivia.com>:`);
				} else if (response.data.allQuestions.nodes.length > 0) {
					await news_channel.send('Une nouvelle question a été postée sur <https://gw2trivia.com>:');
				}
				for (let i = 0, imax = response.data.allQuestions.nodes.length ; i < imax ; i++) {
					const question = response.data.allQuestions.nodes[i];
					await this.post_new_question(guild, news_channel, question);
				}
			});
		}
	}

	async init() {
		if (!this.client.schedule._tasks.some(t => t.id === 'fetch_new_questions')) {
			this.client.schedule.create('fetch_new_questions', '*/15 * * * *', {
				data: {},
				catchUp: true,
				id: 'fetch_new_questions'
			});
		}
	}

};
