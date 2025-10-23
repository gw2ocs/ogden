import type { PartialResponseValue } from '#lib/database';
import { Task } from '#lib/structures';

export class UserTask extends Task {

    public async run(): Promise<PartialResponseValue | null> {
        const { logger, client } = this.container;
        logger.info('Running updateBot task...');

        client.updateActivity();

        return null;
    }
}
