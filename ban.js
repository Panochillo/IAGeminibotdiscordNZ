const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { banUser } = require('../utils/banSystem.js');
const { hasAdminPermission, logPermissionCheck } = require('../utils/permissions.js');
const config = require('../config/config.js');
const logger = require('../utils/logger.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Banear un usuario del bot (Solo administradores)')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuario a banear')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('razon')
                .setDescription('Razón del baneo')
                .setRequired(false)
                .setMaxLength(config.BAN_SETTINGS.MAX_REASON_LENGTH)
        ),

    async execute(interaction) {
        const userId = interaction.user.id;
        
        // Check if user has admin permissions
        if (!hasAdminPermission(userId)) {
            logPermissionCheck(userId, 'ban', false);
            
            const embed = new EmbedBuilder()
                .setColor(config.COLORS.ERROR)
                .setTitle('❌ Sin Permisos')
                .setDescription(config.ERROR_MESSAGES.NO_PERMISSION)
                .setTimestamp();
            
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        logPermissionCheck(userId, 'ban', true);

        const targetUser = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('razon') || 'No se proporcionó razón';

        // Prevent banning admins or the bot itself
        if (hasAdminPermission(targetUser.id)) {
            const embed = new EmbedBuilder()
                .setColor(config.COLORS.ERROR)
                .setTitle('❌ Error')
                .setDescription('No puedes banear a otro administrador.')
                .setTimestamp();
            
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (targetUser.bot) {
            const embed = new EmbedBuilder()
                .setColor(config.COLORS.ERROR)
                .setTitle('❌ Error')
                .setDescription('No puedes banear bots.')
                .setTimestamp();
            
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Defer reply for processing
        try {
            await interaction.deferReply();
        } catch (error) {
            logger.error('Failed to defer reply:', error);
            return;
        }

        try {
            const success = banUser(
                targetUser.id,
                targetUser.username,
                reason,
                interaction.user.username
            );

            if (success) {
                const embed = new EmbedBuilder()
                    .setColor(config.COLORS.SUCCESS)
                    .setTitle('🔨 Usuario Baneado')
                    .setDescription(`**${targetUser.username}** ha sido baneado del bot.`)
                    .addFields(
                        { name: '👤 Usuario', value: `${targetUser.username} (${targetUser.id})`, inline: true },
                        { name: '⚖️ Administrador', value: interaction.user.username, inline: true },
                        { name: '📝 Razón', value: reason, inline: false }
                    )
                    .setFooter({ text: 'GeminiAIBot - Sistema de Baneos' })
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
                logger.info(`User ${targetUser.username} (${targetUser.id}) banned by ${interaction.user.username}`);
            } else {
                const embed = new EmbedBuilder()
                    .setColor(config.COLORS.ERROR)
                    .setTitle('❌ Error')
                    .setDescription(config.ERROR_MESSAGES.ALREADY_BANNED)
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
            }

        } catch (error) {
            logger.error('Error in ban command:', error);
            
            const embed = new EmbedBuilder()
                .setColor(config.COLORS.ERROR)
                .setTitle('❌ Error')
                .setDescription('Ocurrió un error al banear al usuario.')
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        }
    }
};