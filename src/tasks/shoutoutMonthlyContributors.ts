import type { PartialResponseValue } from '#lib/database';
import { Task } from '#lib/structures';
import { fetchT } from '@sapphire/plugin-i18next';

export class UserTask extends Task {

    public async run(): Promise<PartialResponseValue | null> {
        const { logger, client, db } = this.container;
        logger.info('Running shoutoutMonthlyContributors task...');

        // we fetch validated questions from the past month
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);

        const _users = await db.questions.createQueryBuilder('question')
            .select(['COUNT(*) AS amount', 'user.discordId AS uid'])
            .leftJoin('question.user', 'user')
            .where('question.validate IS NOT NULL')
            .andWhere('question.createdAt > :startDate', { startDate })
            .orderBy('amount', 'DESC')
            .groupBy('user.discordId')
            .limit(3)
            .getRawMany<{ amount: number; uid: string }>();

        if (_users.length === 0) return null;

        const guilds = [...client.guilds.cache.values()];
        for (const guild of guilds) {
            const _guild = await db.guilds.findOneBy({ discordId: guild.id });
            const roleId = _guild?.monthlyContributorRole;
            if (!roleId) continue;
            // fetch the role
            const role = guild.roles.resolve(roleId);
            if (!role) continue;
            // reset previous monthly winner
			const previous = [...role.members.values()];
			for (let i = 0, imax = previous.length ; i < imax ; i++) {
				previous[i].roles.remove(role);
			}

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
                    texts.push(_t('shoutout:monthlyContributors:first', {
                        user: first.user.tag,
                        role: role.toString(),
                        count: _users[0].amount
                    }));
                }

                if (_users.length > 1) {
                    const second = guild.members.resolve(_users[1].uid);
                    if (second) {
                        texts.push(_t('shoutout:monthlyContributors:second', {
                            user: second.user.tag,
                            count: _users[1].amount
                        }));
                    }
                }

                if (_users.length > 2) {
                    const third = guild.members.resolve(_users[2].uid);
                    if (third) {
                        texts.push(_t('shoutout:monthlyContributors:third', {
                            user: third.user.tag,
                            count: _users[2].amount
                        }));
                    }
                }

                await channel.send({ content: texts.join('\n') });
            }
        }

        return null;
    }
}
