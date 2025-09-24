import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from "typeorm";
import { AnswerEntity } from "#lib/database/entities/AnswerEntity";
import { CategorieEntity } from "#lib/database/entities/CategorieEntity";
import { ImageEntity } from "#lib/database/entities/ImageEntity";
import { UserEntity } from "#lib/database/entities/UserEntity";
import { QuestionsReactionsUsersRelEntity } from "#lib/database/entities/QuestionsReactionsUsersRelEntity";
import { StatEntity } from "#lib/database/entities/StatEntity";
import { TipEntity } from "#lib/database/entities/TipEntity";

@Index("questions_pkey", ["id"], { unique: true })
@Entity("questions", { schema: "gw2trivia" })
export class QuestionEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id!: number;

  @Column("text", { name: "title" })
  title!: string;

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

  @Column("text", { name: "slug", nullable: true })
  slug!: string | null;

  // @Column("integer", { name: "user_id", default: () => "1" })
  // userId!: number;

  @Column("timestamp without time zone", { name: "validated", nullable: true })
  validated!: Date | null;

  @Column("text", { name: "notes", nullable: true })
  notes!: string | null;

  @Column("integer", { name: "updated_by", nullable: true })
  updatedBy!: number | null;

  @Column("integer", { name: "points", default: () => "1" })
  points!: number;

  @OneToMany(() => AnswerEntity, (answers) => answers.question)
  answers!: AnswerEntity[];

  @ManyToMany(() => CategorieEntity, (categories) => categories.questions)
  categories!: CategorieEntity[];

  @ManyToMany(() => ImageEntity, (images) => images.questions)
  images!: ImageEntity[];

  @ManyToOne(() => UserEntity, (users) => users.questions)
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user!: Relation<UserEntity>;

  @OneToMany(
    () => QuestionsReactionsUsersRelEntity,
    (questionsReactionsUsersRel) => questionsReactionsUsersRel.question
  )
  questionsReactionsUsersRels!: QuestionsReactionsUsersRelEntity[];

  @OneToMany(() => StatEntity, (stats) => stats.question)
  stats!: StatEntity[];

  @OneToMany(() => TipEntity, (tips) => tips.question)
  tips!: TipEntity[];
}
