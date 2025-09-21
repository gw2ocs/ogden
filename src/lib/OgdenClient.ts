import { SapphireClient } from "@sapphire/framework";
import { CLIENT_OPTIONS } from "#root/config";

export class OgdenClient extends SapphireClient {

    public constructor() {
        super(CLIENT_OPTIONS);
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