import type { PartialResponseValue } from '#lib/database';
import { Task } from '#lib/structures';

export class UserTask extends Task {

    public async run(): Promise<PartialResponseValue | null> {
        const { logger, db } = this.container;
        logger.info('Running resetAnnualScores task...');
        
        db.scores.update({ activity: { ref: 'quiz_annual'} }, { amount: 0 })

        return null;
    }
}
