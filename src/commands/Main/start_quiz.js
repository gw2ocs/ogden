const { Command } = require('klasa');
const { DateTime } = require('luxon');
const fetch = require('node-fetch');
const Quiz = require('../../lib/Quiz');

module.exports = class extends Command {

    constructor(...args) {
        /**
         * Any default options can be omitted completely.
         * if all options are default, you can omit the constructor completely
         */
        super(...args, {
            enabled: true,
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
            usage: '[id:number] [channel:channel]',
            usageDelim: ' ',
            quotedStringSupport: false,
            subcommands: false
        });
    }

    async randomSlug(msg) {
        console.log(msg.guild.settings.questions_todo);
        if (msg.guild.settings.questions_todo.length === 0) {
            const list = await fetch(`${process.env.WEBSITEURL}/api/graphql`, {
                method: "post",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: `{
                      allQuestions {
                        nodes {
                          id,
                          slug
                        }
                      }
                    }`
                })
            })
                .then(response => response.json())
                .then(response => response.data.allQuestions.nodes.map(node => node.id));
            console.log(list);
            for (let i = list.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [list[i], list[j]] = [list[j], list[i]];
            }
            console.log(list);
            for (let i = 0, imax = list.length ; i < imax ; i++) {
                await msg.guild.settings.update('questions_todo', list[i], { action: 'add' });
            }
        }
        const slug = msg.guild.settings.questions_todo[0];
        await msg.guild.settings.update('questions_todo', slug, { action: 'remove' });
        return slug;
    }

    async run(msg, [id, channel]) {
        // This is where you place the code you want to run for your command
        //const questions = this.client.gateways.questions.cache;
        channel = channel || msg.guild.channels.cache.get(msg.guild.settings.channels.quiz) || msg.channel; // || msg.guild.channels.get('442975781174509568');
        //id = id || this.randomId(questions);
        //const question = questions.get(id);
        const token = this.client.getJwtToken();
        const question = await fetch(`${process.env.WEBSITEURL}/api/graphql`, {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
            body: JSON.stringify({
                query: `{
                      questionById(id: ${id ? id : await this.randomSlug(msg)}) {
                        id
                        slug
                        fullSlug
                        title
                        createdAt
                        points
                        images {
                          nodes {
                            id
                            type
                          }
                        }
                        userByUserId {
                          avatar
                          discordId
                          discriminator
                          username
                        }
                        categoryByCategoryId {
                          id
                          name
                          slug
                        }
                        tipsByQuestionId {
                          nodes {
                            content
                          }
                        }
                        answersByQuestionId {
                          nodes {
                            content
                          }
                        }
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
                    category: data.categoryByCategoryId && {
                        path: data.categoryByCategoryId.name
                    },
                    answers: data.answersByQuestionId.nodes
                };
            });
        const quiz = new Quiz(this.client, channel, question, DateTime.local(), 1200);
        return quiz.start();
    }

    async init() {
        /*
         * You can optionally define this method which will be run when the bot starts
         * (after login, so discord data is available via this.client)
         */
    }

};
