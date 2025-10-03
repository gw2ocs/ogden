import { container, SapphireClient } from "@sapphire/framework";
import { CLIENT_OPTIONS } from "#root/config";
import { TaskStore } from "./structures/stores/TaskStore.js";
import { TaskManager } from "#lib/structures";
import { Enumerable } from "@sapphire/decorators";
import { QuizManager } from "./structures/managers/QuizManager.js";

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
}