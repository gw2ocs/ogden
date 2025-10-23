import { container, SapphireClient } from "@sapphire/framework";
import { CLIENT_OPTIONS } from "#root/config";
import { TaskStore } from "./structures/stores/TaskStore.js";
import { TaskManager } from "#lib/structures";
import { Enumerable } from "@sapphire/decorators";
import { QuizManager } from "./structures/managers/QuizManager.js";
import { ActivityType } from "discord.js";

export class OgdenClient extends SapphireClient {

	/**
	 * The Schedule manager
	 */
	@Enumerable(false)
	public override schedules: TaskManager;

	/**
	 * The Schedule manager
	 */
	@Enumerable(false)
	public override quizzes: QuizManager;

    public constructor() {
        super(CLIENT_OPTIONS);
		container.stores.register(new TaskStore());

		this.schedules = new TaskManager();
		container.schedule = this.schedules;

        this.quizzes = new QuizManager();
    }

    public override async login(token?: string): Promise<string> {
        const loginResponse = await super.login(token);
        await this.schedules.init();
        await this.quizzes.init();
        return loginResponse;
    }

    public override async destroy(): Promise<void> {
        this.schedules.destroy();
        return super.destroy();
    }

    public override updateActivity() {
		const today = new Date();
		const day = today.getDay();
		let activity = '';
		switch (day) {
			case 0:
				// sunday
				activity = 'Bagarre de barils';
				break;
			case 1:
			case 4:
				// monday and thursday
				activity = 'Lancer de crabe';
				break;
			case 2:
			case 5:
				// tuesday and friday
				activity = 'Course du Sanctuaire';
				break;
			case 3:
			case 6:
				// wednesday and saturday
				activity = 'Survie à Sud-Soleil';
		}
		this.user!.setPresence({ activities: [{ name: activity, type: ActivityType.Watching }]});
	}
}