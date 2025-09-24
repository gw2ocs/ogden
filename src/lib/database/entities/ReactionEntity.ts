import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { QuestionsReactionsUsersRelEntity } from "#lib/database/entities/QuestionsReactionsUsersRelEntity";

@Index("reactions_pkey", ["id"], { unique: true })
@Entity("reactions", { schema: "gw2trivia" })
export class ReactionEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id!: number;

  @Column("text", { name: "label" })
  label!: string;

  @Column("text", { name: "code" })
  code!: string;

  @Column("integer", { name: "sequence", nullable: true, default: () => "5" })
  sequence!: number | null;

  @OneToMany(
    () => QuestionsReactionsUsersRelEntity,
    (questionsReactionsUsersRel) => questionsReactionsUsersRel.reaction
  )
  questionsReactionsUsersRels!: QuestionsReactionsUsersRelEntity[];
}
