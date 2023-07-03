const { Task } = require('klasa');
const { DateTime } = require('luxon');
const fetch = require('node-fetch');
const Quiz = require('../lib/Quiz');

module.exports = class extends Task {

    constructor(...args) {
        /**
         * Any default options can be omitted completely.
         * if all options are default, you can omit the constructor completely
         */
        super(...args, { enabled: true });
    }

    async randomSlug(guild) {
        const { rows: ids } = await this.client.pg.query(`SELECT id FROM gw2trivia.questions WHERE id NOT in (
            SELECT question_id FROM gw2trivia.stats
            WHERE guild_snowflake = $1
            ORDER BY id DESC LIMIT 500
        ) AND validated IS NOT NULL`, [guild.id]);
        const randomIdx = Math.floor(Math.random() * ids.length);
        return ids[randomIdx].id;
    }

    async launchQuiz(_guild, channel) {
        const duration = _guild.settings.config.default_duration || 1200;
        const token = this.client.getJwtToken();
        const slug = await this.randomSlug(_guild);
        console.log(`Loading question ${slug} for ${channel.name} ${_guild.name}`);
        const question = await fetch(`${process.env.WEBSITEURL}/api/graphql`, {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
            body: JSON.stringify({
                query: `{
                  questionById(id: ${slug}) {
                    id slug fullSlug title createdAt points spoil
                    images { nodes { id type } }
                    userByUserId { avatarUrl discordId discriminator username }
                    categories { nodes { id name slug } }
                    tipsByQuestionId { nodes { content } }
                    answersByQuestionId { nodes { content } }
                  }
                }`
            })
        })
            .then(response => response.json())
            .then(response => {
                const data = response.data.questionById;
                return {
                    id: data.id,
                    slug: data.slug,
                    fullSlug: data.fullSlug,
                    title: data.title,
                    points: data.points,
                    created: data.createdAt,
                    user: data.userByUserId,
                    tips: data.tipsByQuestionId.nodes,
                    images: data.images.nodes,
                    categories : data.categories.nodes,
                    answers: data.answersByQuestionId.nodes
                };
            }).catch(e => console.error(JSON.stringify(e)));
        // const { question } = await fetch(`http://ogden.gw2ocs.com/api/questions/view/${await this.randomSlug(_guild)}.json`).then(r => r.json());
        if (!question) return false;
        const quiz = new Quiz(this.client, channel, question, DateTime.local(), duration);
        return quiz.start();
    }

    async run({ guild }) {
        const _guild = this.client.guilds.cache.get(guild);
        if (!_guild || !_guild.settings.config.auto) return;
        const channel = _guild.channels.cache.get(_guild.settings.channels.quiz) || _guild.channels.cache.first();
        
        await this.launchQuiz(_guild, channel);

        const newQuizChannel = _guild.channels.cache.get(_guild.settings.channels.new_quiz);
        if (newQuizChannel) {
            this.launchQuiz(_guild, newQuizChannel);
        }
    }

    async init() {
        /*
         * You can optionally define this method which will be run when the bot starts
         * (after login, so discord data is available via this.client)
         */
    }

};
