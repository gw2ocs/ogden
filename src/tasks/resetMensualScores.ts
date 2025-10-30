import type { PartialResponseValue } from '#lib/database';
import { Task } from '#lib/structures';

export class UserTask extends Task {

    public async run(): Promise<PartialResponseValue | null> {
        const { logger, db } = this.container;
        logger.info('Running resetMensualScores task...');
        
        db.scores.update({ activity: { ref: 'quiz_mensual'} }, { amount: 0 })

        return null;
    }
}
