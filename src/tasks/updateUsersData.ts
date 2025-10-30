import type { PartialResponseValue } from '#lib/database';
import { Task } from '#lib/structures';

export class UserTask extends Task {

    public async run(): Promise<PartialResponseValue | null> {
        const { logger, client, db } = this.container;
        logger.info('Running updateUsersData task...');
        
        const _users = await db.users.find({ select: ['id', 'discordId', 'avatar'] });

        for (const _user of _users) {
            const user = await client.users.fetch(_user.discordId);
            if (!user || user.avatar === _user.avatar) continue;
            _user.avatar = user.avatar;
            db.users.save(_user);
        }

        return null;
    }
}
