import { Schedules } from '#lib/types';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import type { StoreRegistryValue } from '@sapphire/pieces';
import { Cron } from '@sapphire/time-utilities';
import { blue, gray, green, magenta, magentaBright, white, yellow } from 'colorette';

const dev = process.env.NODE_ENV !== 'production';

@ApplyOptions<Listener.Options>({ once: true })
export class UserEvent extends Listener {
	private readonly style = dev ? yellow : blue;

	public async run() {
		await this.initQuiz().catch((error) => this.container.logger.fatal(error));
		await this.initFetchQuestionsTask().catch((error) => this.container.logger.fatal(error));
		await this.initFetchAchievementsTask().catch((error) => this.container.logger.fatal(error));
		this.initUpdateBotTask().catch((error) => this.container.logger.fatal(error));
		this.initUpdateUsersDataTask().catch((error) => this.container.logger.fatal(error));
		this.initResetScoresTasks().catch((error) => this.container.logger.fatal(error));

		this.container.client.updateActivity();

		this.printBanner();
		this.printStoreDebugInformation();
	}

	private async initQuiz() {
		const { logger, schedule: { queue }, db: { channels } } = this.container;
		const quizChannels = await channels.find({ where: { type: 'quiz', quizAutoEnabled: true } });
		for (const channel of quizChannels) {
			try {
				const task = queue.find((task) => task.taskId === Schedules.Quiz && task.data?.channelId === channel.discordId);
				if (task && channel.quizCron !== task.recurring?.toString()) {
					logger.info(`Rescheduling quiz in channel ${channel.discordId} to ${channel.quizCron}`);
					task.recurring = channel.quizCron ? new Cron(channel.quizCron) : null;
					await task.save();
				}
				if (!task && channel.quizCron) {
					logger.info(`Scheduling quiz in channel ${channel.discordId}`);
					await this.container.schedule.add(Schedules.Quiz, channel.quizCron, { data: { channelId: channel.discordId, guildId: channel.guildId } });
				} else if (task && !channel.quizCron) {
					logger.info(`Removing scheduled quiz in channel ${channel.discordId} as cron expression was removed`);
					await this.container.schedule.remove(task);
				}
			} catch (error) {
				logger.error(`Failed to start quiz in channel ${channel.discordId}: ${error}`);
			}
		}
	}

	private async initFetchQuestionsTask() {
		const { logger, schedule: { queue } } = this.container;
		if (!queue.some((task) => task.taskId === Schedules.FetchNewQuestions)) {
			logger.info('Scheduling fetchNewQuestions task to run every 15 minutes');
			await this.container.schedule.add(Schedules.FetchNewQuestions, '*/15 * * * *');
		}
	}

	private async initUpdateBotTask() {
		const { logger, schedule: { queue } } = this.container;
		if (!queue.some((task) => task.taskId === Schedules.UpdateBot)) {
			logger.info('Scheduling updateBot task to run every day at midnight');
			await this.container.schedule.add(Schedules.UpdateBot, '0 0 * * *');
		}
	}

	private async initFetchAchievementsTask() {
		const { logger, schedule: { queue } } = this.container;
		if (!queue.some((task) => task.taskId === Schedules.FetchNewAchievements)) {
			logger.info('Scheduling fetchNewAchievements task to run every 15 minutes');
			await this.container.schedule.add(Schedules.FetchNewAchievements, '*/15 * * * *');
		}
	}

	private async initUpdateUsersDataTask() {
		const { logger, schedule: { queue } } = this.container;
		if (!queue.some((task) => task.taskId === Schedules.UpdateUsersData)) {
			logger.info('Scheduling updateUsersData task to run every day at 04:00');
			await this.container.schedule.add(Schedules.UpdateUsersData, '0 4 * * *');
		}
	}

	private async initResetScoresTasks() {
		const { logger, schedule: { queue } } = this.container;
		if (!queue.some((task) => task.taskId === Schedules.ResetMensualScores)) {
			logger.info('Scheduling resetMensualScores task to run at 00:30 the 1st of every month');
			await this.container.schedule.add(Schedules.ResetMensualScores, '30 0 1 * *');
		}
		if (!queue.some((task) => task.taskId === Schedules.ResetAnnualScores)) {
			logger.info('Scheduling resetAnnualScores task to run at 00:30 the 1st of January');
			await this.container.schedule.add(Schedules.ResetAnnualScores, '30 0 1 1 *');
		}
	}

	private printBanner() {
		const success = green('+');

		const llc = dev ? magentaBright : white;
		const blc = dev ? magenta : blue;

		const line01 = llc('');
		const line02 = llc('');
		const line03 = llc('');

		// Offset Pad
		const pad = ' '.repeat(7);

		console.log(
			String.raw`
${line01} ${pad}${blc('1.0.0')}
${line02} ${pad}[${success}] Gateway
${line03}${dev ? ` ${pad}${blc('<')}${llc('/')}${blc('>')} ${llc('DEVELOPMENT MODE')}` : ''}
		`.trim()
		);
	}

	private printStoreDebugInformation() {
		const { client, logger } = this.container;
		const stores = [...client.stores.values()];
		const last = stores.pop()!;

		for (const store of stores) logger.info(this.styleStore(store, false));
		logger.info(this.styleStore(last, true));
	}

	private styleStore(store: StoreRegistryValue, last: boolean) {
		return gray(`${last ? '└─' : '├─'} Loaded ${this.style(store.size.toString().padEnd(3, ' '))} ${store.name}.`);
	}
}
