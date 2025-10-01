import {
	BaseEntity,
	Column,
	Entity,
	Index,
	OneToMany,
	PrimaryColumn,
} from "typeorm";
import { ChannelEntity } from "#lib/database";

@Index("guilds_pkey", ["discordId"], { unique: true })
@Entity("guilds", { schema: "gw2trivia" })
export class GuildEntity extends BaseEntity {
	@PrimaryColumn("character varying", { name: "discord_id" })
	discordId!: string;

	@Column("character varying", { name: "name" })
	name!: string;

	@Column("character varying", { name: "bot_channel", nullable: true })
	botChannel!: string | null;

	@Column("character varying", { name: "quiz_channel", nullable: true })
	quizChannel!: string | null;

	@Column("character varying", { name: "news_channel", nullable: true })
	newsChannel!: string | null;

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

	@Column("character varying", { name: "last_winner", nullable: true })
	lastWinner!: string | null;

	//@Column("character varying", { name: "last_icon", nullable: true })
	//lastIcon!: string | null;

	@Column("character varying", { name: "subscribers_role", nullable: true })
	subscribersRole!: string | null;

	@Column("character varying", {
		name: "monthly_winner_role",
		nullable: true,
	})
	monthlyWinnerRole!: string | null;

	@Column("character varying", {
		name: "monthly_contributor_role",
		nullable: true,
	})
	monthlyContributorRole!: string | null;

	@OneToMany(() => ChannelEntity, (channels) => channels.guild)
	channels!: ChannelEntity[];

	/*public get client() {
		return Store.injectedContext.client;
	}

	public get guild() {
		return this.client.guilds.cache.get(this.discordId)!;
	}

	public resetAll(): this {
		return this;
	}*/
}
