import { BaseEntity, Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import type { Relation } from "typeorm";
import { QuizEntity, UserEntity } from "#lib/database";

@Entity("quizzes_users_rel", { schema: "gw2trivia" })
export class QuizzesUsersRelEntity extends BaseEntity {
  @Column("integer", { primary: true, name: "quiz_id" })
  quizId!: number;

  @Column("text", { primary: true, name: "user_id" })
  userId!: string;

  @Column("timestamp without time zone", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt!: Date | null;

  @Column("integer", { name: "resolution_duration" })
  resolutionDuration!: number | null;

  @ManyToOne(() => QuizEntity, (quizzes) => quizzes.winners)
  @JoinColumn([{ name: "quiz_id", referencedColumnName: "id" }])
  quiz!: Relation<QuizEntity>;

  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn([{ name: "user_id", referencedColumnName: "discordId" }])
  user!: Relation<UserEntity>
}
