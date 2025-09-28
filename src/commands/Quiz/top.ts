import { ApplyOptions } from '@sapphire/decorators';
import { PaginatedMessage, type EmbedResolvable } from '@sapphire/discord.js-utilities';
import { Args, Command } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { sendLoadingMessage } from '#lib/utils';

@ApplyOptions<Command.Options>({
    description: 'Affiche le top mensuel, annuel et global.',
    generateDashLessAliases: true
})
export class UserCommand extends Command {
    public override async messageRun(message: Message, args: Args) {
        const { logger } = this.container;
        const response = await sendLoadingMessage(message);

        // Fetch args
        const number = await args.pick('number').catch(() => 3);
        const activity = await args.pick('string').catch(() => 'quiz');
        const time = await args.pick('string').catch(() => 'all');
        logger.info(`Top command called by ${message.author.displayName} (${message.author.id}) with number=${number}, activity=${activity} and time=${time}`);

        const paginatedMessage = new PaginatedMessage({
            template: new EmbedBuilder()
                .setColor('#FF0000')
                // Be sure to add a space so this is offset from the page numbers!
                //.setFooter({ text: ' footer after page numbers' })
        });

        if (activity === 'quiz') {
            if (['all', 'mensuel'].indexOf(time) !== -1) {
                paginatedMessage.addPageEmbed(await this.generateTopEmbed(message, number, 'quiz_mensual'), );
            }
            if (['all', 'annuel'].indexOf(time) !== -1) {
                paginatedMessage.addPageEmbed(await this.generateTopEmbed(message, number, 'quiz_annual'));
            }
            if (['all', 'global'].indexOf(time) !== -1) {
                paginatedMessage.addPageEmbed(await this.generateTopEmbed(message, number, 'quiz'));
            }
        } else {
            paginatedMessage.addPageEmbed(await this.generateTopEmbed(message, number, activity));
        }

        await paginatedMessage.run(response, message.author);
        return response;
    }

    private async generateTopEmbed(message: Message, number: number, activity: string): Promise<EmbedResolvable> {
        const { db } = this.container;
        const activityDb = await db.activities.findOne({ where: { ref: activity, guildId: message.guild?.id } });
        if (!activityDb) {
            throw new Error(`L'activité ${activity} n'existe pas sur ce serveur.`);
        }
        console.log(activityDb);
        const scores = await db.scores.find({
            where: { activityId: activityDb.id },
            order: { amount: 'DESC' },
            take: number,
            relations: ['activity', 'user'],
            //select: ['amount', 'user'],
        });
        console.log(scores);
        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle(`🏆 **TOP ${number} ${activityDb.name}** 🏆`);
        
        if (scores.length === 0) {
            embed.setDescription('Aucun score enregistré pour cette activité.');
            return embed;
        } else {
            embed.setDescription(scores.map((score, index) => `**${index + 1}.** **${score.amount}** points - ${score.user ? score.user.username : '*Utilisateur inconnu*'}`).join('\n'));
        }
        return embed;
    }
}
