import { ChannelEntity, GuildEntity, QuestionEntity, UserEntity } from "#lib/database";
import type { QuizManager } from "#lib/structures/managers/QuizManager";
import { ActionRowBuilder, AttachmentBuilder, bold, ButtonBuilder, ButtonStyle, ContainerBuilder, EmbedBuilder, heading, HeadingLevel, hideLinkEmbed, hyperlink, MediaGalleryBuilder, Message, ModalBuilder, SeparatorSpacingSize, subtext, TextInputBuilder, TextInputStyle, time, TimestampStyles, User, userMention } from "discord.js";
import {
    BaseEntity,
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    type Relation,
} from "typeorm";
import { latinize } from "modern-diacritics";
import { container } from "@sapphire/framework";
import { QuizzesUsersRelEntity } from "./QuizzesUsersRelEntity.js";
import { fetchT, type TFunction } from "@sapphire/plugin-i18next";

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

    @Column("boolean", { name: 'running' })
    running!: boolean;

    @Column("character varying", { name: "random_winner_id", nullable: true })
    randomWinnerId!: string;
    
    @ManyToOne(() => GuildEntity, (guilds) => guilds.quizzes, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "guild_id", referencedColumnName: "discordId" }])
    guild!: Relation<GuildEntity>;
    
    @ManyToOne(() => ChannelEntity, (channels) => channels.quizzes, {
        onDelete: "CASCADE",
        eager: true,
    })
    @JoinColumn([{ name: "channel_id", referencedColumnName: "discordId" }])
    channel!: Relation<ChannelEntity>;
    
    @ManyToOne(() => QuestionEntity)
    @JoinColumn([{ name: "question_id", referencedColumnName: "id" }])
    question!: Relation<QuestionEntity>;

    @OneToMany(() => QuizzesUsersRelEntity, (rel) => rel.quiz)
    winners!: Relation<QuizzesUsersRelEntity[]>;

    @ManyToOne(() => UserEntity, { nullable: true, eager: true })
    @JoinColumn([{ name: "random_winner_id", referencedColumnName: "discordId" }])
    randomWinner!: Relation<UserEntity>;

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
    private showTips = false;

    public _t: TFunction | null = null;

    public async resume(): Promise<QuizEntity> {
        if (!this._t || this.messageId && !this.message) {
            const channel = await container.client.channels.fetch(this.channelId).catch(container.logger.error);
            if (this.messageId && !this.message) {
                if (channel?.isTextBased()) {
                    const _message = await channel.messages.fetch(this.messageId).catch(container.logger.error);
                    if (_message) this._message = _message;
                }
            }
            if (!this._t) {
                if (channel?.isTextBased()) {
                    this._t = await fetchT(channel);
                }
            }
        }

        const timeLeft = this.endsAt.getTime() - new Date().getTime();
        setTimeout(() => {
            this.stop();
        }, timeLeft);
        const timeMiddle = this.startedAt.getTime() + this.duration * 500 - new Date().getTime();
        setTimeout(() => {
            this.showTips = true;
            if (this.message) this.message.edit({ components: this.components });
        }, timeMiddle);
        return this;
    }

    public stop() {
        this.stopped = true;
        this.running = false;
        if (this.channel && this.channel.quizRandomDraw && this.winners.length && !this.randomWinner) {
            this.randomWinner = this.winners[Math.floor(Math.random() * this.winners.length)].user;
        }
        this.save();
        if (this.message) this.message.edit({ components: this.components });
        this.manager.stopQuiz(this);
    }

    public renderv2(): ContainerBuilder {
        let color = 0xc7c7c7;

        const component = new ContainerBuilder()
            .addTextDisplayComponents(
                textDisplay => textDisplay
                    .setContent(
                        heading(
                            hyperlink(this.question.title, hideLinkEmbed(`${process.env.WEBSITEURL}/questions/view/${this.question.id}/${this.question.slug}`)), 
                            HeadingLevel.Three)))
            .addTextDisplayComponents(d => d.setContent(`${this._t!('quiz:container:author')} [${this.question.user.username}](${process.env.WEBSITEURL}/questions?user_id=${this.question.user.id})`))
            .addTextDisplayComponents(d => d.setContent(`${this._t!('quiz:container:points')} ${this.question.points}`));

        if (this.stopped) {
            color = 0x808080;
            component.addTextDisplayComponents(d => d.setContent(this._t!('quiz:container:ended')));
        } else {
            component.addTextDisplayComponents(d => d.setContent(`${this._t!('quiz:container:endsAt')} ${time(this.endsAt, TimestampStyles.RelativeTime)} ⏰`));
        }

        if (this.winners && this.winners.length > 0) {
            color = 0xffd700;
            const winners = this.winners.sort((a, b) => a.resolutionDuration! - b.resolutionDuration!).slice(0, 3);
            component.addTextDisplayComponents(d => d.setContent(`${this._t!('quiz:container:goodAnswers')} ${this.winners.length}\n${winners.map((w, i) => this._t!('quiz.top.podium', { user: userMention(w.user.discordId), count: i + 1 }) ).join('\n')}`));
        }

        if (this.randomWinner) {
            component
                .addSeparatorComponents(sep => sep.setDivider(false).setSpacing(SeparatorSpacingSize.Small))
                .addTextDisplayComponents(d => d.setContent(`${bold(this._t!('quiz:container:randomWinner'))} ${userMention(this.randomWinner.discordId)}`));
        }

        if (this.question.categories.length) {
            component
                .addSeparatorComponents(sep => sep.setDivider(false).setSpacing(SeparatorSpacingSize.Small))
                .addTextDisplayComponents(d => d.setContent(`${bold(this._t!('quiz:container:categories'))} ${this.question.categories.map(c => c.name).join(', ')}`));
        }

        if (this.question.tips.length && this.showTips) {
            component
                .addSeparatorComponents(sep => sep.setDivider(false).setSpacing(SeparatorSpacingSize.Small))
                .addTextDisplayComponents(d => d.setContent(`${bold(this._t!('quiz:container:tips'))}${this.question.tips.map(tip => `\n - ||${tip.content}||`).join('')}`));
        }

        component
            .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(d => d.setContent(subtext(this._t!('quiz:container:missNoQuestion'))))

        component.setAccentColor(color);

        return component;
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

    private _gallery: MediaGalleryBuilder | null = null;
    public get gallery() {
        if (!this._gallery) {
            this._gallery = new MediaGalleryBuilder();
            for (const img of this.question.images) {
                this._gallery.addItems(item => item.setURL(`attachment://image_${img.id}.${img.type?.split('/')[1] ?? 'png'}`));
            }
        }
        return this._gallery;
    }

    private _attachments: AttachmentBuilder[] | null = null;
    public get attachments() {
        if (!this._attachments) {
            this._attachments = [];
            for (const img of this.question.images) {
                const base64String = img.content!.toString('utf-8').replace(/^data:image\/\w+;base64,/, "");
                this._attachments.push(new AttachmentBuilder(Buffer.from(base64String, 'base64'), { name: `image_${img.id}.${img.type?.split('/')[1] ?? 'png'}` }));
            }
        }
        return this._attachments;
    }

    public get components() {
        const components: any[] = [this.renderv2()];
        if (this.question.images.length) components.push(this.gallery);
        const actions = this.getActionRow();
        if (actions.components.length > 0) components.push(actions.toJSON());
        return components;
    }

    public getActionRow() {
        const row = new ActionRowBuilder();
        if (!this.stopped) {
            const answer = new ButtonBuilder()
                .setCustomId(`quiz_answer_${this.id}`)
                .setLabel(this._t!('quiz:actions:reply'))
                .setStyle(ButtonStyle.Primary);
            row.addComponents(answer);
        }

        if (this.winners && this.winners.length > 0) {
            const top = new ButtonBuilder()
                .setCustomId(`quiz_top_${this.id}`)
                .setLabel(this._t!('quiz:actions:top'))
                .setStyle(ButtonStyle.Secondary);
            row.addComponents(top);
        }

        return row;
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
            .setLabel(this._t!('quiz:modal:answer'))
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
        const { db } = container;
        const _user = await db.users.ensure(user);
        const rel = new QuizzesUsersRelEntity();
        rel.quiz = this;
        rel.user = _user;
        rel.resolutionDuration = new Date().getTime() - this.startedAt.getTime();
        await rel.save();
        if (this.winners) this.winners.push(rel);
        else this.winners = [rel];

        await Promise.all(['quiz', 'quiz_mensual', 'quiz_annual'].map(activity => _user.addPoints(activity, this.points, this.guild.discordId)));

        await this.save().catch(err => container.logger.error(err));
        return this.message.edit({ components: this.components });
    }

    public hasUserAnswered(user: User) {
        return this.winners?.some(u => u.userId === user.id) || false;
    }

    public testAnswer(answer: string): boolean {
        return this.question.answers
            .some(ans => ans.content.split(/\s*;\s*/)
                .every(str => RegExp(latinize(str.trim(), {}).replace(/ /g, '.*').replace(/[’'-]/g, '.').replace(/\b(\d+)\b/g, '\\b$1\\b'), "gi")
                    .test(latinize(answer, {}).replace(/-/g, ' '))));
    }
}
