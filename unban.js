const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { unbanUser, isBanned } = require('../utils/banSystem.js');
const { hasAdminPermission, logPermissionCheck } = require('../utils/permissions.js');
const config = require('../config/config.js');
const logger = require('../utils/logger.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Desbanear un usuario del bot (Solo administradores)')
        .addStringOption(option =>
            option.setName('userid')
                .setDescription('ID del usuario a desbanear')
                .setRequired(true)
        ),

    async execute(interaction) {
        const userId = interaction.user.id;
        
        // Check if user has admin permissions
        if (!hasAdminPermission(userId)) {
            logPermissionCheck(userId, 'unban', false);
            
            const embed = new EmbedBuilder()
                .setColor(config.COLORS.ERROR)
                .setTitle('❌ Sin Permisos')
                .setDescription(config.ERROR_MESSAGES.NO_PERMISSION)
                .setTimestamp();
            
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        logPermissionCheck(userId, 'unban', true);

        const targetUserId = interaction.options.getString('userid');

        // Validate user ID format
        if (!/^\d{17,19}$/.test(targetUserId)) {
            const embed = new EmbedBuilder()
                .setColor(config.COLORS.ERROR)
                .setTitle('❌ ID Inválido')
                .setDescription('Por favor proporciona un ID de Discord válido.')
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
            // Check if user is actually banned
            const bannedUser = isBanned(targetUserId);
            if (!bannedUser) {
                const embed = new EmbedBuilder()
                    .setColor(config.COLORS.ERROR)
                    .setTitle('❌ Usuario No Encontrado')
                    .setDescription(config.ERROR_MESSAGES.USER_NOT_FOUND)
                    .setTimestamp();

                return interaction.editReply({ embeds: [embed] });
            }

            const success = unbanUser(targetUserId, interaction.user.username);

            if (success) {
                const embed = new EmbedBuilder()
                    .setColor(config.COLORS.SUCCESS)
                    .setTitle('✅ Usuario Desbaneado')
                    .setDescription(`**${bannedUser.username}** ha sido desbaneado del bot.`)
                    .addFields(
                        { name: '👤 Usuario', value: `${bannedUser.username} (${targetUserId})`, inline: true },
                        { name: '⚖️ Administrador', value: interaction.user.username, inline: true },
                        { name: '📅 Baneado Originalmente', value: new Date(bannedUser.bannedAt).toLocaleString('es-ES'), inline: false },
                        { name: '📝 Razón Original', value: bannedUser.reason, inline: false }
                    )
                    .setFooter({ text: 'GeminiAIBot - Sistema de Baneos' })
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
                logger.info(`User ${bannedUser.username} (${targetUserId}) unbanned by ${interaction.user.username}`);
            } else {
                const embed = new EmbedBuilder()
                    .setColor(config.COLORS.ERROR)
                    .setTitle('❌ Error')
                    .setDescription('No se pudo desbanear al usuario.')
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
            }

        } catch (error) {
            logger.error('Error in unban command:', error);
            
            const embed = new EmbedBuilder()
                .setColor(config.COLORS.ERROR)
                .setTitle('❌ Error')
                .setDescription('Ocurrió un error al desbanear al usuario.')
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        }
    }
};