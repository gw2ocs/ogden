const { Task } = require('klasa');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = class extends Task {

	constructor(...args) {
		super(...args, { enabled: true });
	}

	async post_new_article(guild, channel, article) {
		const embed = new MessageEmbed()
			.setColor(0x8080ff)
			.setAuthor(article.userByUserId.username, article.userByUserId.avatarUrl, `${process.env.WEBSITEURL}/questions?user_id=${article.userByUserId.id}`)
			.setTimestamp(new Date(article.validatedAt))
			.setTitle(article.title)
			.setURL(`${process.env.WEBSITEURL}/articles/view/${article.id}/${article.slug}`)
			.addField('Auteur', `<@${article.userByUserId.discordId}>`, true);
		if (article.categories.nodes.length) {
			embed.addField('Categories', article.categories.nodes.map(q => q.name).join(', '));
		}
		if (article.description) {
			embed.setDescription(article.description);
		}
		await channel.send('Un nouvel article a été publié sur <https://gw2trivia.com>:');
		channel.send({ embed });
	}

	async run(metadata) {
		const guilds = [...this.client.guilds.cache.values()];
		for (let i = 0, imax = guilds.length ; i < imax ; i++) {
			const guild = guilds[i];
			const { last_article_check } = await this.client.getDBClient(this.client);
			const news_channel = guild.channels.resolve(guild.settings.channels.news);
			if (!news_channel) continue;
			const query = `{
						allArticles${last_article_check && `(filter: {validatedAt: {greaterThan: ${JSON.stringify(last_article_check)}}})` || ''} {
							nodes {
								userByUserId { id discordId username discriminator avatarUrl }
								categories { nodes { name } }
								slug title id validatedAt description imageId
							}
							pageInfo { endCursor }
						}
                    }`;
			fetch(`${process.env.WEBSITEURL}/api/graphql`, {
                method: "post",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query })
            })
                .then(response => response.json())
                .then(async response => {
				await this.client.pg.query('UPDATE gw2trivia.clients SET last_article_check = $1 WHERE discord_id = $2', [(new Date()).toLocaleString('en-US-u-hc-h23', {timeZone: 'Europe/Paris', dateStyle: "short", timeStyle: "medium"}), this.client.user.id]);
				for (let i = 0, imax = response.data.allArticles.nodes.length ; i < imax ; i++) {
					const article = response.data.allArticles.nodes[i];
					await this.post_new_article(guild, news_channel, article);
				}
			});
		}
	}

	async init() {
		if (!this.client.schedule._tasks.some(t => t.id === 'fetch_new_articles')) {
			this.client.schedule.create('fetch_new_articles', '*/30 * * * *', {
				data: {},
				catchUp: true,
				id: 'fetch_new_articles'
			});
		}
	}

};
