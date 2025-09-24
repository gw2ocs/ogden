import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("groups_pkey", ["id"], { unique: true })
@Entity("groups", { schema: "gw2trivia" })
export class GroupEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id!: number;

  @Column("text", { name: "name" })
  name!: string;

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

  @Column("boolean", {
    name: "is_admin",
    nullable: true,
    default: () => "false",
  })
  isAdmin!: boolean | null;

  @Column("integer", { name: "updated_by", nullable: true })
  updatedBy!: number | null;
}
