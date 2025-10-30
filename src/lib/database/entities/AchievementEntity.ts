import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { RoleEntity } from "#lib/database/entities/RoleEntity";
import { AchievementsUsersRelEntity } from "#lib/database/entities/AchievementsUsersRelEntity";

@Index("achievements_pkey", ["id"], { unique: true })
@Index("achievements_role_id_idx", ["roleId"], {})
@Entity("achievements", { schema: "gw2trivia" })
export class AchievementEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id!: number;

  @Column("text", { name: "name" })
  name!: string;

  @Column("text", { name: "description", nullable: true })
  description!: string | null;

  @Column("text", { name: "query", nullable: true })
  query!: string | null;

  @Column("boolean", { name: "hidden", nullable: true, default: () => "false" })
  hidden!: boolean | null;

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

  @Column("integer", { name: "role_id" })
  roleId!: number;

  @Column("text", { name: "triggered_on" })
  triggeredOn!: string;

  @Column("integer", { name: "goal", default: () => "1" })
  goal!: number;

  @Column("character varying", { name: "icon", nullable: true, length: 10 })
  icon!: string | null;

  @Column("character varying", { name: "theme", nullable: true, length: 50 })
  theme!: string | null;

  @Column("integer", { name: "sequence", default: () => "10" })
  sequence!: number;

  @Column("integer", { name: "updated_by", nullable: true })
  updatedBy!: number | null;

  @ManyToOne(() => RoleEntity, (roles) => roles.achievements, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "role_id", referencedColumnName: "id" }])
  role!: RoleEntity;

  @OneToMany(
    () => AchievementsUsersRelEntity,
    (achievementsUsersRel) => achievementsUsersRel.achievement
  )
  achievementsUsersRels!: AchievementsUsersRelEntity[];
}
