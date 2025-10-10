import {
  BaseEntity,
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ScoreEntity } from "./ScoreEntity.js";

@Index("activities_pkey", ["id"], { unique: true })
@Entity("activities", { schema: "gw2trivia" })
export class ActivityEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id!: number;

  @Column("text", { name: "name", nullable: true })
  name!: string | null;

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

  @Column("text", { name: "ref", nullable: true })
  ref!: string | null;

  @Column("integer", { name: "updated_by", nullable: true })
  updatedBy!: number | null;

  @Column("text", { name: "guild_id" })
  guildId!: string;

  @OneToMany(() => ScoreEntity, (scores) => scores.activity)
  scores!: ScoreEntity[];
}
