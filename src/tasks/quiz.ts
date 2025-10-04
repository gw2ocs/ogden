import type { PartialResponseValue } from '#lib/database';
import { Task } from '#lib/structures';
import { ChannelType } from 'discord.js';

export class UserTask extends Task {

    public async run(data: QuizTaskOptions): Promise<PartialResponseValue | null> {
        const { logger, client } = this.container;
        logger.info('Running quiz task...');

        const channelId = data.channelId as string;
        const guildId = data.guildId as string;
        if (!channelId) {
            logger.warn('No channelId provided for quiz task.');
            return null;
        }
        if (!guildId) {
            logger.warn('No guildId provided for quiz task.');
            return null;
        }

        const channel = client.guilds.cache.get(guildId)?.channels.cache.get(channelId);
        if (!channel) {
            logger.warn(`Channel with ID ${channelId} not found in cache.`);
            return null;
        }
        if (!channel.isTextBased() || channel.type !== ChannelType.GuildText) {
            logger.warn(`Channel with ID ${channelId} is not a text-based channel.`);
            return null;
        }

        await client.quizzes.startQuiz(channel);

        return null;
    }
}

export interface QuizTaskOptions {
    channelId: string;
    guildId: string;
};