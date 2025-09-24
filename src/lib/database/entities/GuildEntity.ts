import {
	BaseEntity,
	Column,
	Entity,
	Index,
	OneToMany,
	PrimaryGeneratedColumn,
} from "typeorm";
import { GuildsUsersRelEntity } from "#lib/database/entities/GuildsUsersRelEntity";

@Index("guilds_pkey", ["id"], { unique: true })
@Entity("guilds", { schema: "ogden" })
export class GuildEntity extends BaseEntity {
	@PrimaryGeneratedColumn({ type: "integer", name: "id" })
	id!: number;

	@Column("character varying", { name: "discord_id" })
	discordId!: string;

	@Column("character varying", { name: "bot_channel_id", nullable: true })
	botChannelId!: string | null;

	@Column("character varying", { name: "quiz_channel_id", nullable: true })
	quizChannelId!: string | null;

	@Column("character varying", { name: "news_channel_id", nullable: true })
	newsChannelId!: string | null;

	@Column("boolean", {
		name: "quiz_auto",
		nullable: true,
		default: () => "false",
	})
	quizAuto!: boolean | null;

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

	@Column("character varying", { name: "last_icon", nullable: true })
	lastIcon!: string | null;

	@Column("character varying", { name: "subscriber_role_id", nullable: true })
	subscriberRoleId!: string | null;

	@Column("character varying", {
		name: "monthly_winner_role_id",
		nullable: true,
	})
	monthlyWinnerRoleId!: string | null;

	@Column("character varying", {
		name: "monthly_contributor_role_id",
		nullable: true,
	})
	monthlyContributorRoleId!: string | null;

	@OneToMany(() => GuildsUsersRelEntity, (guildsUsersRel) => guildsUsersRel.guild)
	guildsUsersRels!: GuildsUsersRelEntity[];

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
