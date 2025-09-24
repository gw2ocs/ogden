import { Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from "typeorm";
import { GuildEntity } from "#lib/database/entities/GuildEntity";
import { UserEntity } from "#lib/database/entities/UserEntity";

@Index("guilds_users_rel_pkey", ["guildId", "userId"], { unique: true })
@Entity("guilds_users_rel", { schema: "ogden" })
export class GuildsUsersRelEntity {
	@Column("integer", { primary: true, name: "user_id" })
	userId!: number;

	@Column("integer", { primary: true, name: "guild_id" })
	guildId!: number;

	@Column("integer", { name: "annual_points", default: () => "0" })
	annualPoints!: number;

	@Column("integer", { name: "mensual_points", default: () => "0" })
	mensualPoints!: number;

	@Column("integer", { name: "total_points", default: () => "0" })
	totalPoints!: number;

	@ManyToOne(() => GuildEntity, (guilds) => guilds.guildsUsersRels)
	@JoinColumn([{ name: "guild_id", referencedColumnName: "id" }])
	guild!: GuildEntity;

	@ManyToOne(() => UserEntity, (users) => users.guildsUsersRels)
	@JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
	user!: Relation<UserEntity>;
}
