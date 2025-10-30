import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import type { Relation } from "typeorm";
import { QuestionEntity } from "#lib/database/entities/QuestionEntity";
import { ReactionEntity } from "#lib/database/entities/ReactionEntity";
import { UserEntity } from "#lib/database/entities/UserEntity";

@Index("questions_reactions_users_rel_question_id_idx", ["questionId"], {})
@Index(
  "questions_reactions_users_rel_pkey",
  ["questionId", "reactionId", "userId"],
  { unique: true }
)
@Index("questions_reactions_users_rel_reaction_id_idx", ["reactionId"], {})
@Index("questions_reactions_users_rel_user_id_idx", ["userId"], {})
@Entity("questions_reactions_users_rel", { schema: "gw2trivia" })
export class QuestionsReactionsUsersRelEntity {
  @Column("integer", { primary: true, name: "question_id" })
  questionId!: number;

  @Column("integer", { primary: true, name: "reaction_id" })
  reactionId!: number;

  @Column("integer", { primary: true, name: "user_id" })
  userId!: number;

  @Column("timestamp without time zone", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt!: Date | null;

  @ManyToOne(
    () => QuestionEntity,
    (questions) => questions.questionsReactionsUsersRels
  )
  @JoinColumn([{ name: "question_id", referencedColumnName: "id" }])
  question!: Relation<QuestionEntity>;

  @ManyToOne(
    () => ReactionEntity,
    (reactions) => reactions.questionsReactionsUsersRels
  )
  @JoinColumn([{ name: "reaction_id", referencedColumnName: "id" }])
  reaction!: ReactionEntity;

  @ManyToOne(() => UserEntity, (users) => users.questionsReactionsUsersRels)
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user!: Relation<UserEntity>;
}
