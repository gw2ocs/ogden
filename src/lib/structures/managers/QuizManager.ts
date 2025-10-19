import { QuizEntity, StatEntity } from "#lib/database";
import { container } from "@sapphire/framework";
import { Time } from "@sapphire/time-utilities";
import { MessageFlags, type BaseGuildTextChannel, type Message } from "discord.js";

export class QuizManager {
    public quizzes: QuizEntity[] = [];

    public async init() {
        const { quizzes } = container.db;
        const entries = await quizzes.find({ where: { running: true }, relations: ["channel", "guild", "question", "question.answers", "question.images", "question.categories", "question.tips", "question.user", "winners"]});

        for (const entry of entries) this._insert(await entry.setup(this).resume());
    }
    
    private _insert(entity: QuizEntity) {
        this.quizzes.push(entity);

        return entity;
    }

    private async getRandomQuestionId(channel: BaseGuildTextChannel): Promise<number> {
        const { questions, channels } = container.db;
        const _channel = await channels.findOne({ where: { discordId: channel.id } });
        if (!_channel) {
            return 0;
        }
        let query = questions.createQueryBuilder("question")
            .select("question.id")
            .where((qb) => {
                const subQuery = qb
                    .subQuery()
                    .select("st.questionId")
                    .from(StatEntity, "st")
                    .where('st.guild_snowflake = :guildId')
                    .orderBy("st.id", "DESC")
                    .limit(500)
                    .getQuery()
                return "question.id NOT IN " + subQuery
            })
            .setParameter("guildId", channel.guild.id);
        if (_channel.filter) {
            query = query
                .leftJoin(_channel.filter.joinRelation, _channel.filter.joinAlias)
                .andWhere(_channel.filter.where);
        }
        const ids = await query.getMany();
        const randomIdx = Math.floor(Math.random() * ids.length);
        return ids[randomIdx].id;
    }

    private async getRandomQuestion(channel: BaseGuildTextChannel) {
        const { questions } = container.db;
        const id = await this.getRandomQuestionId(channel);
        const question = await questions.findOne({ where: { id }, relations: ["answers", "images", "categories", "tips", "user"] });
        if (!question) throw new Error("Question not found.");
        return question;
    }

    public async stopQuiz(quiz: QuizEntity) {
        this.quizzes = this.quizzes.filter(q => q.id !== quiz.id);
    }

    public async startQuiz(channel: BaseGuildTextChannel) {
        const { channels } = container.db;
        const _channel = await channels.findOne({ where: { discordId: channel.id }, relations: ["guild"] });
        if (!_channel) throw new Error("Channel not found in database.");
        if (_channel.type !== "quiz") throw new Error("Channel is not a quiz channel.");
        //if (this.quizzes.find(q => q.channelId === channel.id)) throw new Error("A quiz is already running in this channel.");

        const guild = channel.guild;

        const _question = await this.getRandomQuestion(channel);

        const quiz = new QuizEntity();
        quiz.channel = _channel;
        quiz.guild = _channel.guild;
        quiz.question = _question;
        quiz.startedAt = new Date();
        quiz.duration = _channel.quizDefaultDuration || 3600;
        quiz.points = _question.points || 1;
        quiz.running = true;
        await quiz.save();

        const { logger } = container;
        logger.info(`Starting quiz in guild ${guild.id} (${guild.name}) on channel ${channel.id} (${channel.name}) with question ${_question.id} (${_question.title})`);

        this._insert(await quiz.setup(this).resume());

        const { role: _role } = _channel;
        const role = _role ? guild.roles.cache.get(_role) : null;
        let firstMessage: Message | null = null;
        if (role) {
            firstMessage = await channel.send(`Oyez, oyez, ${role} ! Dans 30 secondes je poserai ma question. Soyez prêts !`);
        }
        setTimeout(async () => {
            if (firstMessage) firstMessage.delete();
            if (role) {
                await channel.send(`${role}, voici ma question :`);
            }
            const message = await channel.send({ components: quiz.components, files: quiz.attachments, flags: MessageFlags.IsComponentsV2 });
            quiz.message = message;
            await quiz.save();
        }, Time.Second * 30);

        return quiz;
    }

    public getQuiz(quizId: number) {
        return this.quizzes.find(q => q.id === quizId);
    }
}