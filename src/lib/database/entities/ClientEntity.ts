import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("clients_pkey", ["id"], { unique: true })
@Entity("clients", { schema: "gw2trivia" })
export class ClientEntity {
	@PrimaryGeneratedColumn({ type: "integer", name: "id" })
	id!: number;

	@Column("character varying", { name: "discord_id", default: process.env.CLIENT_ID })
	discordId: string | undefined = process.env.CLIENT_ID;

	@Column("integer", { name: "last_question_id", nullable: true })
	lastQuestionId!: number | null;

	@Column("integer", { name: "last_achievement_id", nullable: true })
	lastAchievementId!: number | null;

	@Column("integer", { name: "last_article_id", nullable: true })
	lastArticleId!: number | null;
}
