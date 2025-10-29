import type { PartialResponseValue } from '#lib/database';
import { Task } from '#lib/structures';
import { fetchT } from '@sapphire/plugin-i18next';

export class UserTask extends Task {

    public async run(): Promise<PartialResponseValue | null> {
        const { logger, client, db } = this.container;
        logger.info('Running shoutoutMonthlyWinner task...');

        const guilds = [...client.guilds.cache.values()];
        for (const guild of guilds) {
            const _guild = await db.guilds.findOneBy({ discordId: guild.id });
            const roleId = _guild?.monthlyWinnerRole;
            if (!roleId) continue;
            // fetch the role
            const role = guild.roles.resolve(roleId);
            if (!role) continue;
            // reset previous monthly winner
			const previous = [...role.members.values()];
			for (let i = 0, imax = previous.length ; i < imax ; i++) {
				previous[i].roles.remove(role);
			}

            // fetch new monthly winner
            const _users = await db.scores.createQueryBuilder('score')
                .select(['score.amount AS amount', 'user.discordId AS uid'])
                .leftJoin('score.activity', 'activity')
                .leftJoin('score.user', 'user')
                .where('activity.ref = :ref', { ref: 'quiz_mensual' })
                .andWhere('activity.guildId = :guildId', { guildId: guild.id })
                .andWhere('score.amount > 0')
                .orderBy('score.amount', 'DESC')
                .limit(3)
                .getRawMany<{ amount: number; uid: string }>();

            if (_users.length === 0) continue;

            const first = guild.members.resolve(_users[0].uid);
            if (first) {
                await first.roles.add(role);
            }

            const _channels = await db.channels.findBy({ guildId: guild.id, type: 'news' });

            for (const _channel of _channels) {
                const channel = guild.channels.resolve(_channel.discordId);
                if (!channel?.isTextBased() || !channel.permissionsFor(guild.members.me!).has(['ViewChannel', 'SendMessages', 'EmbedLinks'])) {
                    continue;
                }

                const texts = [];
                const _t = await fetchT(channel);

                if (first) {
                    texts.push(_t('shoutout:monthlyWinners:first', {
                        user: first.user.tag,
                        role: role.toString(),
                        points: _t('misc:points', { count: _users[0].amount })
                    }));
                }

                if (_users.length > 1) {
                    const second = guild.members.resolve(_users[1].uid);
                    if (second) {
                        texts.push(_t('shoutout:monthlyWinners:second', {
                            user: second.user.tag,
                            points: _t('misc:points', { count: _users[1].amount })
                        }));
                    }
                }

                if (_users.length > 2) {
                    const third = guild.members.resolve(_users[2].uid);
                    if (third) {
                        texts.push(_t('shoutout:monthlyWinners:third', {
                            user: third.user.tag,
                            points: _t('misc:points', { count: _users[2].amount })
                        }));
                    }
                }

                await channel.send({ content: texts.join('\n') });
            }
        }

        return null;
    }
}
