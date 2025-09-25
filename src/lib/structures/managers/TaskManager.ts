import { ResponseType, type ResponseValue, TaskEntity } from '#lib/database/entities/TaskEntity';
import { Cron, Time } from '@sapphire/time-utilities';
import { container } from "@sapphire/pieces";

export class TaskManager {
	public queue: TaskEntity[] = [];
	private interval: NodeJS.Timeout | null = null;

	public destroy() {
		this._clearInterval();
	}

	public async init() {
		const { tasks } = container.db;
		const entries = await tasks.find();

		for (const entry of entries) this._insert(entry.setup(this).resume());
		this._checkInterval();
	}

	public async add(taskId: string, timeResolvable: TimeResolvable, options: ScheduleManagerAddOptions = {}) {
		if (!container.stores.get('tasks').has(taskId)) throw new Error(`The task '${taskId}' does not exist.`);

		const [time, cron] = this._resolveTime(timeResolvable);
		const entry = new TaskEntity();
		entry.taskId = taskId;
		entry.time = time;
		entry.recurring = cron;
		entry.catchUp = options.catchUp ?? true;
		entry.data = options.data ?? {};
		await entry.save();

		this._insert(entry.setup(this).resume());
		this._checkInterval();
		return entry;
	}

	public async reschedule(entityOrId: TaskEntity | number, time: Date | number) {
		if (typeof entityOrId === 'number') {
			entityOrId = this.queue.find((entity) => entity.id === entityOrId)!;
			if (!entityOrId) return false;
		}

		entityOrId.pause();
		entityOrId.time = new Date(time);
		await entityOrId.save();

		this._remove(entityOrId);
		this._insert(entityOrId);
		return true;
	}

	public async remove(entityOrID: TaskEntity | number) {
		if (typeof entityOrID === 'number') {
			entityOrID = this.queue.find((entity) => entity.id === entityOrID)!;
			if (!entityOrID) return false;
		}

		await entityOrID.pause().remove();
		this._remove(entityOrID);
		this._checkInterval();
		return true;
	}

	public async execute() {
		if (this.queue.length) {
			// Process the active tasks, they're sorted by the time they end
			const now = Date.now();
			const execute: Promise<ResponseValue>[] = [];
			for (const entry of this.queue) {
				if (entry.time.getTime() > now) break;
				execute.push(entry.run());
			}

			// Check if the Schedule has a task to run and run them if they exist
			if (!execute.length) return;
			await this._handleResponses(await Promise.all(execute));
		}

		this._checkInterval();
	}

	private _insert(entity: TaskEntity) {
		const index = this.queue.findIndex((entry) => entry.time > entity.time);
		if (index === -1) this.queue.push(entity);
		else this.queue.splice(index, 0, entity);

		return entity;
	}

	private _remove(entity: TaskEntity) {
		const index = this.queue.indexOf(entity);
		if (index !== -1) this.queue.splice(index, 1);
	}

	private async _handleResponses(responses: readonly ResponseValue[]) {
		const { connection } = container.db;
		const queryRunner = connection.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		const updated: TaskEntity[] = [];
		const removed: TaskEntity[] = [];
		try {
			for (const response of responses) {
				// Pause so it is not re-run
				response.entry.pause();

				switch (response.type) {
					case ResponseType.Delay: {
						response.entry.time = new Date(response.entry.time.getTime() + response.value);
						updated.push(response.entry);
						await queryRunner.manager.save(response.entry);
						continue;
					}
					case ResponseType.Finished: {
						removed.push(response.entry);
						await queryRunner.manager.remove(response.entry);
						continue;
					}
					case ResponseType.Ignore: {
						continue;
					}
					case ResponseType.Update: {
						response.entry.time = response.value;
						updated.push(response.entry);
						await queryRunner.manager.save(response.entry);
					}
				}
			}

			// Commit transaction
			await queryRunner.commitTransaction();

			// Update cache
			// - Remove expired entries
			for (const entry of removed) {
				this._remove(entry);
			}

			// - Update indexes
			for (const entry of updated) {
				const index = this.queue.findIndex((entity) => entity === entry);
				if (index === -1) continue;

				this.queue.splice(index, 1);
				this._insert(entry);

				// Resume so it can be run again
				entry.resume();
			}
		} catch (error) {
			container.logger.error(error);

			// Rollback transaction
			await queryRunner.rollbackTransaction();

			// Reload all entities
			await Promise.all(updated.map((entry) => entry.reload()));
		} finally {
			// Release transaction
			await queryRunner.release();
		}
	}

	/**
	 * Clear the current interval
	 */
	private _clearInterval(): void {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = null;
		}
	}

	/**
	 * Sets the interval when needed
	 */
	private _checkInterval(): void {
		if (!this.queue.length) this._clearInterval();
		else if (!this.interval) this.interval = setInterval(this.execute.bind(this), container.client.options.schedule?.interval ?? Time.Minute);
	}

	/**
	 * Resolve the time and cron
	 * @param time The time or Cron pattern
	 */
	private _resolveTime(time: TimeResolvable): [Date, Cron | null] {
		if (time instanceof Date) return [time, null];
		if (time instanceof Cron) return [time.next(), time];
		if (typeof time === 'number') return [new Date(time), null];
		if (typeof time === 'string') {
			const cron = new Cron(time);
			return [cron.next(), cron];
		}
		throw new Error('invalid time passed');
	}
}

export interface ScheduleManagerAddOptions {
	/**
	 * If the task should try to catch up if the bot is down.
	 */
	catchUp?: boolean;

	/**
	 * The data to pass to the Task piece when the ScheduledTask is ready for execution.
	 */
	data?: Record<string, unknown>;
}

export type TimeResolvable = number | Date | string | Cron;
