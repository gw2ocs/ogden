import { ChannelEntity, GuildEntity } from "#lib/database";
import {
    BaseEntity,
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    type Relation,
} from "typeorm";

@Index("quizzes_pkey", ["id"], { unique: true })
@Entity("quizzes", { schema: "gw2trivia" })
export class QuizEntity extends BaseEntity {
    @PrimaryGeneratedColumn({ name: "id" })
    id!: string;

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
}
