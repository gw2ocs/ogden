import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ArticleEntity } from "#lib/database/entities/ArticleEntity";
import { QuestionEntity } from "#lib/database/entities/QuestionEntity";

@Index("categories_pkey", ["id"], { unique: true })
@Entity("categories", { schema: "gw2trivia" })
export class CategorieEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id!: number;

  @Column("integer", { name: "parent_id", nullable: true })
  parentId!: number | null;

  @Column("text", { name: "name" })
  name!: string;

  @Column("text", { name: "description", nullable: true })
  description!: string | null;

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

  @Column("text", { name: "slug" })
  slug!: string;

  @Column("integer", { name: "updated_by", nullable: true })
  updatedBy!: number | null;

  @ManyToMany(() => ArticleEntity, (articles) => articles.categories)
  articles!: ArticleEntity[];

  @ManyToMany(() => QuestionEntity, (questions) => questions.categories)
  @JoinTable({
    name: "categories_questions_rel",
    joinColumns: [{ name: "category_id", referencedColumnName: "id" }],
    inverseJoinColumns: [{ name: "question_id", referencedColumnName: "id" }],
    schema: "gw2trivia",
  })
  questions!: QuestionEntity[];
}
