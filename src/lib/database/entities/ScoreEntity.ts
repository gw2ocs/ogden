import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  type Relation,
} from "typeorm";
import { ActivityEntity, UserEntity } from "#lib/database/entities";

@Index("points_pkey", ["activityId", "userId"], { unique: true })
@Entity("scores", { schema: "gw2trivia" })
export class ScoreEntity extends BaseEntity {
  @PrimaryColumn("integer", { name: "activity_id" })
  activityId!: number;

  @PrimaryColumn("integer", { name: "user_id" })
  userId!: number;

  @Column("integer", { name: "amount" })
  amount!: number;

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

  @ManyToOne(() => ActivityEntity, (activities) => activities.scores, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "activity_id", referencedColumnName: "id" }])
  activity!: Relation<ActivityEntity>;

  @ManyToOne(() => UserEntity, (users) => users.scores, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user!: Relation<UserEntity>;
}
