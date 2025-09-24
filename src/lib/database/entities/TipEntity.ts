import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  type Relation,
  PrimaryGeneratedColumn,
} from "typeorm";
import { QuestionEntity } from "#lib/database/entities/QuestionEntity";

@Index("tips_pkey", ["id"], { unique: true })
@Entity("tips", { schema: "gw2trivia" })
export class TipEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id!: number;

  @Column("text", { name: "content" })
  content!: string;

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

  @ManyToOne(() => QuestionEntity, (questions) => questions.tips)
  @JoinColumn([{ name: "questionId", referencedColumnName: "id" }])
  question!: Relation<QuestionEntity>;
}
