import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { fetchT } from '@sapphire/plugin-i18next';
import type { Message } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Reboots the bot.',
	detailedDescription: 'This command will immediately terminate the process, causing a reboot if a process manager is used.',
	preconditions: ['OwnerOnly'],
})
export class UserCommand extends Command {
	public override async messageRun(message: Message) {
		const _t = await fetchT(message);
		const content = _t('system:rebooting');
		await send(message, content).catch((error) => this.container.logger.fatal(error));

		process.exit(0);
	}
}
