import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { StatEntity } from "#lib/database/entities/StatEntity";

@Index("stats_messages_pkey", ["id"], { unique: true })
@Index("stats_messages_stat_id_idx", ["statId"], {})
@Entity("stats_messages", { schema: "gw2trivia" })
export class StatsMessageEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id!: number;

  @Column("integer", { name: "stat_id", nullable: true })
  statId!: number | null;

  @Column("text", { name: "message", nullable: true })
  message!: string | null;

  @ManyToOne(() => StatEntity, (stats) => stats.statsMessages, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "stat_id", referencedColumnName: "id" }])
  stat!: Relation<StatEntity>;
}
