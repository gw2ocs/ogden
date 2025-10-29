import { container, SapphireClient } from "@sapphire/framework";
import { CLIENT_OPTIONS } from "#root/config";
import { TaskStore } from "./structures/stores/TaskStore.js";
import { TaskManager } from "#lib/structures";
import { Enumerable } from "@sapphire/decorators";
import { QuizManager } from "./structures/managers/QuizManager.js";
import { ActivityType } from "discord.js";
import { Quaggans } from '#lib/types';

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

	public override updateServerAvatar() {
		const today = new Date();
		const day = today.getDate();
		const month = today.getMonth();
		const guild = this.guilds.resolve('656508733412605962');

		if (!guild?.available) return;

		let url = Quaggans.Baby;
		switch (month) {
			case 0:
				if (day === 1) url = Quaggans.Party;
				else url = Quaggans.Hood_up;
				break;
			case 1:
				if (day === 2) url = Quaggans.Pancake;
				else if (day === 14) url = Quaggans.Girly;
				else url = Quaggans.Hood_down;
				break;
			case 6:
				url = Quaggans.Relax;
				break;
			case 7:
				url = Quaggans.Bowl;
				break;
			case 9:
				if (day >= 15) url = Quaggans.Ghost;
				else url = Quaggans.Hood_down;
				break;
			case 10:
				url = Quaggans.Hood_up;
				break;
			case 11:
				if (day === 24) url = Quaggans.Present;
				else if (day === 31) url = Quaggans.Party;
				else url = Quaggans.Christmas;
				break;
		}
		guild.setIcon(url);
	}
}