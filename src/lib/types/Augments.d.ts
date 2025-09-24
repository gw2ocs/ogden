import { OgdenOrm } from "#lib/database";

declare module '@sapphire/pieces' {
	interface Container {
		db: OgdenOrm
	}
}