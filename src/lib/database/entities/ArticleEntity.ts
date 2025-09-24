import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from "typeorm";
import { ImageEntity } from "#lib/database/entities/ImageEntity";
import { UserEntity } from "#lib/database/entities/UserEntity";
import { CategorieEntity } from "#lib/database/entities/CategorieEntity";

@Index("articles_pkey", ["id"], { unique: true })
@Index("articles_by_slug", ["slug"], {})
@Index("articles_user_id_idx", ["userId"], {})
@Entity("articles", { schema: "gw2trivia" })
export class ArticleEntity {
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

  @Column("integer", { name: "user_id", default: () => "14" })
  userId!: number;

  @Column("timestamp without time zone", {
    name: "validated_at",
    nullable: true,
  })
  validatedAt!: Date | null;

  @Column("text", { name: "description", nullable: true })
  description!: string | null;

  @Column("text", { name: "markdown", nullable: true })
  markdown!: string | null;

  @Column("text", { name: "html", nullable: true })
  html!: string | null;

  @Column("integer", { name: "updated_by", nullable: true })
  updatedBy!: number | null;

  @ManyToOne(() => ImageEntity, (images) => images.articles, {
    onDelete: "SET NULL",
  })
  @JoinColumn([{ name: "image_id", referencedColumnName: "id" }])
  image!: ImageEntity;

  @ManyToOne(() => UserEntity, (users) => users.articles, {
    onDelete: "DEFAULT",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user!: Relation<UserEntity>;

  @ManyToOne(() => UserEntity, (users) => users.validatedArticles, { onDelete: "SET NULL" })
  @JoinColumn([{ name: "validated_by", referencedColumnName: "id" }])
  validatedBy!: Relation<UserEntity>;

  @ManyToMany(() => CategorieEntity, (categories) => categories.articles)
  @JoinTable({
    name: "articles_categories_rel",
    joinColumns: [{ name: "article_id", referencedColumnName: "id" }],
    inverseJoinColumns: [{ name: "category_id", referencedColumnName: "id" }],
    schema: "gw2trivia",
  })
  categories!: CategorieEntity[];

  @ManyToMany(() => UserEntity, (users) => users.articles3)
  @JoinTable({
    name: "articles_proofreaders_rel",
    joinColumns: [{ name: "article_id", referencedColumnName: "id" }],
    inverseJoinColumns: [{ name: "user_id", referencedColumnName: "id" }],
    schema: "gw2trivia",
  })
  users!: UserEntity[];
}
