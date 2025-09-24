import { Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from "typeorm";
import { AchievementEntity } from "#lib/database/entities/AchievementEntity";
import { UserEntity } from "#lib/database/entities/UserEntity";

@Index("achievements_users_achievement_id_idx", ["achievementId"], {})
@Index("achievements_users_rel_pkey", ["achievementId", "userId"], {
  unique: true,
})
@Index("achievements_users_user_id_idx", ["userId"], {})
@Entity("achievements_users_rel", { schema: "gw2trivia" })
export class AchievementsUsersRelEntity {
  @Column("integer", { primary: true, name: "achievement_id" })
  achievementId!: number;

  @Column("integer", { primary: true, name: "user_id" })
  userId!: number;

  @Column("timestamp without time zone", {
    name: "created_at",
    default: () => "LOCALTIMESTAMP",
  })
  createdAt!: Date;

  @ManyToOne(
    () => AchievementEntity,
    (achievements) => achievements.achievementsUsersRels,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "achievement_id", referencedColumnName: "id" }])
  achievement!: Relation<AchievementEntity>;

  @ManyToOne(() => UserEntity, (users) => users.achievementsUsersRels, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user!: UserEntity;
}
