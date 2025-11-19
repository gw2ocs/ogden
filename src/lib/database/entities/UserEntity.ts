import {
  Column,
  Entity,
  Index,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AchievementsUsersRelEntity } from "#lib/database/entities/AchievementsUsersRelEntity";
import { ArticleEntity } from "#lib/database/entities/ArticleEntity";
import { ImageEntity } from "#lib/database/entities/ImageEntity";
import { QuestionEntity } from "#lib/database/entities/QuestionEntity";
import { QuestionsReactionsUsersRelEntity } from "#lib/database/entities/QuestionsReactionsUsersRelEntity";
import { ScoreEntity } from "./ScoreEntity.js";
import { container } from "@sapphire/framework";

@Index("users_discord_id_uniq", ["discordId"], { unique: true })
@Index("users_pkey", ["id"], { unique: true })
@Entity("users", { schema: "gw2trivia" })
export class UserEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id!: number;

  @Column("text", { name: "username" })
  username!: string;

  @Column("text", { name: "discord_id", unique: true })
  discordId!: string;

  @Column("text", { name: "discriminator" })
  discriminator!: string;

  @Column("text", { name: "avatar", nullable: true })
  avatar!: string | null;

  @Column("text", { name: "locale", default: () => "'en-US'" })
  locale: string = "en-US";

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

  @Column("integer", { name: "group_id", default: () => "5" })
  groupId!: number;

  @Column("integer", { name: "updated_by", nullable: true })
  updatedBy!: number | null;

  @OneToMany(
    () => AchievementsUsersRelEntity,
    (achievementsUsersRel) => achievementsUsersRel.user
  )
  achievementsUsersRels!: AchievementsUsersRelEntity[];

  @OneToMany(() => ArticleEntity, (articles) => articles.user)
  articles!: ArticleEntity[];

  @OneToMany(() => ArticleEntity, (articles) => articles.validatedBy)
  validatedArticles!: ArticleEntity[];

  @ManyToMany(() => ArticleEntity, (articles) => articles.users)
  articles3!: ArticleEntity[];

  @OneToMany(() => ImageEntity, (images) => images.user)
  images!: ImageEntity[];

  @OneToMany(() => ScoreEntity, (scores) => scores.user)
  scores!: ScoreEntity[];

  @OneToMany(() => QuestionEntity, (questions) => questions.user)
  questions!: QuestionEntity[];

  @OneToMany(
    () => QuestionsReactionsUsersRelEntity,
    (questionsReactionsUsersRel) => questionsReactionsUsersRel.user
  )
  questionsReactionsUsersRels!: QuestionsReactionsUsersRelEntity[];

  get avatarUrl() {
  	if (!this.avatar) return `https://cdn.discordapp.com/embed/avatars/${Number(this.discriminator) % 5}.png`;
  	return `https://cdn.discordapp.com/avatars/${this.discordId}/${this.avatar}.${this.avatar.startsWith('a') ? 'gif' : 'png'}`;
  }

  public async addPoints(activityName: string, points: number, guildId: string) {
    const { db } = container;
    const _activity = (await db.activities.findOne({ where: { ref: activityName, guildId } }))
                    ?? (await db.activities.create({ ref: activityName, guildId }).save());
    const _score = (await db.scores.findOne({ where: { activityId: _activity.id, userId: this.id } }))
                    ?? (await db.scores.create({ activityId: _activity.id, userId: this.id, amount: 0 }).save());
    _score.amount += points;
    return _score.save();
  }
}
