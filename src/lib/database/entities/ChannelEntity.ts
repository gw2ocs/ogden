import { GuildEntity, QuizEntity } from "#lib/database";
import {
    BaseEntity,
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryColumn,
    type Relation,
} from "typeorm";

@Index("channels_pkey", ["discordId"], { unique: true })
@Entity("channels", { schema: "gw2trivia" })
export class ChannelEntity extends BaseEntity {
    @PrimaryColumn("character varying", { name: "discord_id" })
    discordId!: string;

    @Column("character varying", { name: "guild_id" })
    guildId!: string;

    @Column("character varying", { name: "type" })
    type!: string;

    @Column("character varying", { name: "role", nullable: true })
    role!: string | null;

    @Column("timestamp without time zone", {
        name: "created_at",
        default: () => "LOCALTIMESTAMP",
    })
    createdAt!: Date;

    @Column("timestamp without time zone", {
        name: "updated_at",
        default: () => "LOCALTIMESTAMP",
    })
    updatedAt!: Date;

    @Column("integer", { name: "updated_by", nullable: true })
    updatedBy!: number | null;

    @Column("boolean", {
        name: "quiz_auto_enabled",
        nullable: true,
        default: () => "false",
    })
    quizAutoEnabled!: boolean | null;

    @Column("character varying", {
        name: "quiz_cron",
        nullable: true,
        default: () => "'0 * * * *'",
    })
    quizCron!: string | null;

    @Column("integer", {
        name: "quiz_default_duration",
        nullable: true,
        default: () => "3600",
    })
    quizDefaultDuration!: number | null;

    @Column("character varying", {
        name: "language",
        default: () => "en-US"
    })
    language!: string | null;

    @Column("jsonb", { name: "filter" })
    filter!: {
        joinAlias: string,
        joinRelation: string,
        where: string
    } | null;

    @Column("boolean", { name: "quiz_random_draw" })
    quizRandomDraw!: boolean;
    
    @ManyToOne(() => GuildEntity, (guilds) => guilds.channels, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "guild_id", referencedColumnName: "discordId" }])
    guild!: Relation<GuildEntity>;
    
    @OneToMany(() => QuizEntity, (quizzes) => quizzes.channel)
    quizzes!: QuizEntity[];
}
