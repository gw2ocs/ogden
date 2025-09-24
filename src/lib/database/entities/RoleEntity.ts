import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AchievementEntity } from "#lib/database/entities/AchievementEntity";

@Index("roles_pkey", ["id"], { unique: true })
@Entity("roles", { schema: "gw2trivia" })
export class RoleEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id!: number;

  @Column("text", { name: "discord_id" })
  discordId!: string;

  @Column("text", { name: "guild_id" })
  guildId!: string;

  @Column("text", { name: "name" })
  name!: string;

  @Column("boolean", { name: "hidden", nullable: true, default: () => "false" })
  hidden!: boolean | null;

  @OneToMany(() => AchievementEntity, (achievements) => achievements.role)
  achievements!: AchievementEntity[];
}
