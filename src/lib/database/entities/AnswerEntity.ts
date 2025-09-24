import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { QuestionEntity } from "#lib/database/entities/QuestionEntity";

@Index("answers_answer_id_idx", ["answerId"], {})
@Index("answers_pkey", ["id"], { unique: true })
@Index("answers_question_id_idx", ["questionId"], {})
@Entity("answers", { schema: "gw2trivia" })
export class AnswerEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id!: number;

  @Column("text", { name: "content" })
  content!: string;

  @Column("integer", { name: "question_id" })
  questionId!: number;

  @Column("integer", { name: "answer_id", nullable: true })
  answerId!: number | null;

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

  @ManyToOne(() => AnswerEntity, (answers) => answers.answers, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "answer_id", referencedColumnName: "id" }])
  answer!: AnswerEntity;

  @OneToMany(() => AnswerEntity, (answers) => answers.answer)
  answers!: AnswerEntity[];

  @ManyToOne(() => QuestionEntity, (questions) => questions.answers, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "question_id", referencedColumnName: "id" }])
  question!: Relation<QuestionEntity>;
}
