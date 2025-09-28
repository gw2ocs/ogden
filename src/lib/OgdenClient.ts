import { container, SapphireClient } from "@sapphire/framework";
import { CLIENT_OPTIONS } from "#root/config";
import { TaskStore } from "./structures/stores/TaskStore.js";
import { TaskManager } from "#lib/structures";
import { Enumerable } from "@sapphire/decorators";

export class OgdenClient extends SapphireClient {

	/**
	 * The Schedule manager
	 */
	@Enumerable(false)
	public override schedules: TaskManager;

    public constructor() {
        super(CLIENT_OPTIONS);
		container.stores.register(new TaskStore());

		// Analytics
		this.schedules = new TaskManager();
		container.schedule = this.schedules;
    }

    public override async login(token?: string): Promise<string> {
        const loginResponse = await super.login(token);
        //await this.schedules.init();
        return loginResponse;
    }

    public override async destroy(): Promise<void> {
        //this.scheduless.destroy();
        return super.destroy();
    }
}