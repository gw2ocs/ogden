import { ChannelEntity, GuildEntity, QuestionEntity, UserEntity } from "#lib/database";
import type { QuizManager } from "#lib/structures/managers/QuizManager";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Message, ModalBuilder, TextInputBuilder, TextInputStyle, User } from "discord.js";
import {
    BaseEntity,
    Column,
    Entity,
    Index,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
    type Relation,
} from "typeorm";
import { latinize } from "modern-diacritics";
import { container } from "@sapphire/framework";

@Index("quizzes_pkey", ["id"], { unique: true })
@Entity("quizzes", { schema: "gw2trivia" })
export class QuizEntity extends BaseEntity {
    @PrimaryGeneratedColumn({ name: "id" })
    id!: number;

    @Column("character varying", { name: "guild_id" })
    guildId!: string;

    @Column("character varying", { name: "channel_id" })
    channelId!: string;

    @Column("character varying", { name: "message_id" })
    messageId!: string;

    @Column("integer", { name: "question_id" })
    questionId!: number;

    @Column("integer", { name: "duration" })
    duration!: number;

    @Column("integer", { name: "points" })
    points!: number;

    @Column("timestamp without time zone", { name: "started_at" })
    startedAt!: Date;
    
    @ManyToOne(() => GuildEntity, (guilds) => guilds.quizzes, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "guild_id", referencedColumnName: "discordId" }])
    guild!: Relation<GuildEntity>;
    
    @ManyToOne(() => ChannelEntity, (channels) => channels.quizzes, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "channel_id", referencedColumnName: "discordId" }])
    channel!: Relation<ChannelEntity>;
    
    @ManyToOne(() => QuestionEntity)
    @JoinColumn([{ name: "question_id", referencedColumnName: "id" }])
    question!: Relation<QuestionEntity>;

    @ManyToMany(() => UserEntity)
    @JoinTable({ name: "quizzes_users_rel", joinColumn: { name: "quiz_id", referencedColumnName: "id" }, inverseJoinColumn: { name: "user_id", referencedColumnName: "discordId" } })
    winners!: Relation<UserEntity[]>;

    private manager: QuizManager = null!;

    private _endsAt: Date | null = null;
    public get endsAt() {
        if (this._endsAt) return this._endsAt;
        this._endsAt = new Date(this.startedAt.getTime() + this.duration * 1000);
        return this._endsAt;
    }

    private _message: Message = null!;
    public get message() {
        return this._message;
    }
    public set message(value: Message) {
        this._message = value;
        this.messageId = value.id;
    }

    private embed: EmbedBuilder = null!;

    public setup(manager: QuizManager) {
        this.manager = manager;
        this.manager;
        return this;
    }

    private stopped = false;

    public async resume(): Promise<QuizEntity> {
        if (this.messageId && !this.message) {
            const channel = await container.client.channels.fetch(this.channelId).catch(() => null);
            if (channel?.isTextBased()) {
                const _message = await channel.messages.fetch(this.messageId).catch(() => null);
                if (_message) this._message = _message;
            }
        }
        const timeLeft = this.endsAt.getTime() - new Date().getTime();
        setTimeout(() => {
            this.stop();
        }, timeLeft);
        const timeMiddle = this.startedAt.getTime() + this.duration * 500 - new Date().getTime();
        if (new Date().getTime() < timeMiddle) {
            setTimeout(() => {
                this.message.edit({ embeds: [this.render()] });
            }, timeMiddle);
        }
        return this;
    }

    public stop() {
        this.stopped = true;
        this.message.edit({ embeds: [this.render()], components: [] });
        this.manager.stopQuiz(this);
    }

    public render(): EmbedBuilder {
        const description: String[] = [];
        if (!this.embed) {
            this.embed =  new EmbedBuilder()
                .setTitle(this.question.title)
                .setColor(0xc7c7c7)
                .setURL(`https://gw2trivia.com/questions/view/${this.question.id}/${this.question.slug}`)
                .setFooter({ text: `${this.points} point${this.points !== 1 ? 's' : ''} | Fini à` })
                .setTimestamp(this.endsAt);
            if (this.question.user) {
                this.embed.setAuthor({ name: this.question.user.username, iconURL: this.question.user.avatarUrl, url: `https://gw2trivia.com/questions?user_id=${this.question.user.id}` });
            }
            if (this.question.categories.length) {
                this.embed.addFields({ name: 'Catégories', value: this.question.categories.map(c => c.name).join(', '), inline: false });
            }
        }
        if (this.stopped) {
            description.push('**Fini !**');
        } else {
            description.push(`Fin : <t:${Math.floor(this.endsAt.getTime() / 1000)}:R> ⏰`);
        }
        if (this.winners && this.winners.length > 0) {
            this.embed.setColor(0xffd700);
            description.push(`Bonnes réponses : ${this.winners.length}`);
        }
        if (this.question.tips.length && new Date().getTime() > this.startedAt.getTime() + this.duration * 500) {
            description.push('Indices :', ...this.question.tips.map(tip => ` - ||${tip.content}||`));
        }
        return this.embed.setDescription(description.join('\n'));
    }

    public getActionRow() {
        const answer = new ButtonBuilder()
            .setCustomId(`quiz_answer_${this.id}`)
            .setLabel('Répondre')
            .setStyle(ButtonStyle.Primary);

        return new ActionRowBuilder()
            .addComponents(answer);
    }

    public getModal() {
        let title = this.question.title;
        if (title.length > 45) {
            title = title.slice(0, 44) + '…';
        }
        const modal = new ModalBuilder()
            .setCustomId(`quiz_modal_${this.id}`)
            .setTitle(title);
            
        // Create the text input components
        const quizAnswerInput = new TextInputBuilder()
            .setCustomId('quizAnswerInput')
            // The label is the prompt the user sees for this input
            .setLabel("Réponse")
            // Short means only a single line of text
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        // An action row only holds one text input,
        // so you need one action row per text input.
        const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(quizAnswerInput);

        // Add inputs to the modal
        modal.addComponents(firstActionRow);
        
        return modal;
    }

    public async addWinner(user: User) {
        const _user = await container.db.users.ensure(user);
        this.winners = [...(this.winners || []), _user];
        await this.save();
        return this.message.edit({ embeds: [this.render()] })
    }

    public hasUserAnswered(user: User) {
        return this.winners?.some(u => u.discordId === user.id) || false;
    }

    public testAnswer(answer: string): boolean {
        return this.question.answers
            .some(ans => ans.content.split(/\s*;\s*/)
                .every(str => RegExp(latinize(str.trim(), {}).replace(/ /g, '.*').replace(/[’'-]/g, '.').replace(/\b(\d+)\b/g, '\\b$1\\b'), "gi")
                    .test(latinize(answer, {}).replace(/-/g, ' '))));
    }
}
