import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from "typeorm";
import { QuestionEntity } from "#lib/database/entities/QuestionEntity";
import { StatsMessageEntity } from "#lib/database/entities/StatsMessageEntity";

@Index("stats_pkey", ["id"], { unique: true })
@Index("stats_question_id_idx", ["questionId"], {})
@Entity("stats", { schema: "gw2trivia" })
export class StatEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id!: number;

  @Column("integer", { name: "question_id" })
  questionId!: number;

  @Column("text", { name: "user_snowflake", nullable: true })
  userSnowflake!: string | null;

  @Column("text", { name: "guild_snowflake" })
  guildSnowflake!: string;

  @Column("text", { name: "message", nullable: true })
  message!: string | null;

  @Column("integer", { name: "resolution_duration" })
  resolutionDuration!: number;

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

  @ManyToOne(() => QuestionEntity, (questions) => questions.stats, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "question_id", referencedColumnName: "id" }])
  question!: Relation<QuestionEntity>;

  @OneToMany(() => StatsMessageEntity, (statsMessages) => statsMessages.stat)
  statsMessages!: StatsMessageEntity[];
}
