import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { ApplicationIntegrationType, InteractionContextType, MessageFlags } from 'discord.js';

@ApplyOptions<Command.Options>({
    description: 'Être notifié dès qu\'Ogden pose une question. À exécuter dans le salon du quiz.'
})
export class UserCommand extends Command {

    public override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
                .setContexts([InteractionContextType.Guild])
        );
    }

    public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        if (!interaction.guild) return;
        if (!interaction.channel?.isSendable()) return;

        const { db } = this.container;

        const channel = interaction.channel;
        const member = interaction.guild.members.cache.get(interaction.user.id);

        const _channel = await db.channels.findOne({ where: { discordId: channel.id } });
        if (!_channel) {
            return interaction.reply({ content: 'Ce salon n\'est pas configuré.', flags: MessageFlags.Ephemeral });
        }
        const { role: roleId } = _channel;
        if (!roleId) {
            return interaction.reply({ content: 'Aucun rôle n\'est configuré pour ce salon.', flags: MessageFlags.Ephemeral });
        }
        const role = interaction.guild.roles.cache.get(roleId);
        if (!role) {
            return interaction.reply({ content: 'Le rôle configuré pour ce salon est introuvable.', flags: MessageFlags.Ephemeral });
        }
        await member?.roles.add(role);
        return interaction.reply({ content: `Vous avez été abonné avec succès au rôle ${role.name}.`, flags: MessageFlags.Ephemeral });
    }
}