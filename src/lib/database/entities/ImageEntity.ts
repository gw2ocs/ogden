import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from "typeorm";
import { ArticleEntity } from "#lib/database/entities/ArticleEntity";
import { UserEntity } from "#lib/database/entities/UserEntity";
import { QuestionEntity } from "#lib/database/entities/QuestionEntity";

@Index("images_pkey", ["id"], { unique: true })
@Index("images_user_id_idx", ["userId"], {})
@Entity("images", { schema: "gw2trivia" })
export class ImageEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id!: number;

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

  @Column("integer", { name: "user_id", default: () => "1" })
  userId!: number;

  @Column("bytea", { name: "content", nullable: true })
  content!: Buffer | null;

  @Column("text", { name: "type", nullable: true })
  type!: string | null;

  @Column("integer", { name: "updated_by", nullable: true })
  updatedBy!: number | null;

  @OneToMany(() => ArticleEntity, (articles) => articles.image)
  articles!: ArticleEntity[];

  @ManyToOne(() => UserEntity, (users) => users.images)
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user!: Relation<UserEntity>;

  @ManyToMany(() => QuestionEntity, (questions) => questions.images)
  @JoinTable({
    name: "images_questions_rel",
    joinColumns: [{ name: "image_id", referencedColumnName: "id" }],
    inverseJoinColumns: [{ name: "question_id", referencedColumnName: "id" }],
    schema: "gw2trivia",
  })
  questions!: QuestionEntity[];
}
