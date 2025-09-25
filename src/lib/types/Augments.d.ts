import { OgdenOrm } from "#lib/database";
import { TaskStore } from "#lib/structures";
import type { TaskManager } from "#lib/structures/managers/TaskManager";

declare module 'discord.js' {
	interface Client {
		readonly schedules: TaskManager;
	}

	interface ClientOptions {
		schedule?: {
			interval: number;
		};
	}
}

declare module '@sapphire/pieces' {
	interface Container {
		db: OgdenOrm
	}

	interface StoreRegistryEntries {
		tasks: TaskStore;
	}
}