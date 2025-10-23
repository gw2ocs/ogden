import { OgdenOrm } from "#lib/database";
import { TaskStore } from "#lib/structures";
import type { QuizManager } from "#lib/structures/managers/QuizManager";
import type { TaskManager } from "#lib/structures/managers/TaskManager";

declare module 'discord.js' {
	interface Client {
		readonly schedules: TaskManager;
		readonly quizzes: QuizManager;

		public updateActivity(): void;
	}

	interface ClientOptions {
		schedule?: {
			interval: number;
		};
	}
}

declare module '@sapphire/pieces' {
	interface Container {
		db: OgdenOrm,
		schedule: TaskManager;
	}

	interface StoreRegistryEntries {
		tasks: TaskStore;
	}
}