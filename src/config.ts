import { container, LogLevel } from "@sapphire/framework";
import { envParseArray, setup } from "@skyra/env-utilities";
import { GatewayIntentBits, Partials } from "discord.js";
import type { ClientOptions } from "discord.js";
import { join } from "node:path";
import { rootFolder } from "#lib/constants";

// Read config:
setup(join(rootFolder, 'src', '.env'));

export const OWNERS: string[] | undefined = envParseArray('CLIENT_OWNERS');

export const CLIENT_OPTIONS: ClientOptions = {
	defaultPrefix: 'o!',
	regexPrefix: /^ogden[,! ]/i,
	caseInsensitiveCommands: true,
	logger: {
		level: LogLevel.Debug
	},
	shards: 'auto',
	intents: [
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.GuildExpressions,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.MessageContent
	],
	partials: [Partials.Channel],
	loadMessageCommandListeners: true,
	i18n: {
		fetchLanguage: async (context) => {
			const { db } = container;
			if (context.channel) {
				const _channel = await db.channels.findOneBy({ discordId: context.channel.id });
				if (_channel?.language) return _channel.language;
			}
			if (context.guild) {
				const _guild = await db.guilds.findOneBy({ discordId: context.guild.id });
				if (_guild?.language) return _guild.language;
			}
			return 'en-US';
		}
	}
};