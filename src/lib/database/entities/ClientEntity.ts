import { Column, Entity, Index, PrimaryColumn } from "typeorm";

@Index("clients_pkey", ["discordId"], { unique: true })
@Entity("clients", { schema: "gw2trivia" })
export class ClientEntity {
	@PrimaryColumn("character varying", { name: "discord_id", default: process.env.CLIENT_ID })
	discordId: string | undefined = process.env.CLIENT_ID;

	@Column("timestamp without time zone", { name: "last_question_check", nullable: true })
	lastQuestionCheck!: Date | null;

	@Column("timestamp without time zone", { name: "last_achievement_check", nullable: true })
	lastAchievementCheck!: Date | null;

	@Column("timestamp without time zone", { name: "last_article_check", nullable: true })
	lastArticleCheck!: Date | null;
}
