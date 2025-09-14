const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getBannedUsers, getBanStats } = require('../utils/banSystem.js');
const { hasAdminPermission, logPermissionCheck } = require('../utils/permissions.js');
const config = require('../config/config.js');
const logger = require('../utils/logger.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banlist')
        .setDescription('Ver lista de usuarios baneados (Solo administradores)')
        .addIntegerOption(option =>
            option.setName('pagina')
                .setDescription('Página a mostrar (10 usuarios por página)')
                .setRequired(false)
                .setMinValue(1)
        ),

    async execute(interaction) {
        const userId = interaction.user.id;
        
        // Check if user has admin permissions
        if (!hasAdminPermission(userId)) {
            logPermissionCheck(userId, 'banlist', false);
            
            const embed = new EmbedBuilder()
                .setColor(config.COLORS.ERROR)
                .setTitle('❌ Sin Permisos')
                .setDescription(config.ERROR_MESSAGES.NO_PERMISSION)
                .setTimestamp();
            
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        logPermissionCheck(userId, 'banlist', true);

        // Defer reply for processing
        try {
            await interaction.deferReply();
        } catch (error) {
            logger.error('Failed to defer reply:', error);
            return;
        }

        try {
            const bannedUsers = getBannedUsers();
            const stats = getBanStats();
            const page = interaction.options.getInteger('pagina') || 1;
            const usersPerPage = 10;
            const totalPages = Math.ceil(bannedUsers.length / usersPerPage);

            if (bannedUsers.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor(config.COLORS.SUCCESS)
                    .setTitle('📋 Lista de Baneados')
                    .setDescription('¡No hay usuarios baneados! 🎉')
                    .setFooter({ text: 'GeminiAIBot - Sistema de Baneos' })
                    .setTimestamp();

                return interaction.editReply({ embeds: [embed] });
            }

            if (page > totalPages) {
                const embed = new EmbedBuilder()
                    .setColor(config.COLORS.ERROR)
                    .setTitle('❌ Página No Encontrada')
                    .setDescription(`La página ${page} no existe. Total de páginas: ${totalPages}`)
                    .setTimestamp();

                return interaction.editReply({ embeds: [embed] });
            }

            // Calculate pagination
            const startIndex = (page - 1) * usersPerPage;
            const endIndex = startIndex + usersPerPage;
            const usersToShow = bannedUsers.slice(startIndex, endIndex);

            // Create embed
            const embed = new EmbedBuilder()
                .setColor(config.COLORS.WARNING)
                .setTitle('📋 Lista de Usuarios Baneados')
                .setDescription(`Página ${page} de ${totalPages} | Total: ${stats.totalBanned} usuario(s) baneado(s)`)
                .setFooter({ text: 'GeminiAIBot - Sistema de Baneos' })
                .setTimestamp();

            // Add banned users to embed
            let description = '';
            usersToShow.forEach((user, index) => {
                const userNumber = startIndex + index + 1;
                const bannedDate = new Date(user.bannedAt).toLocaleDateString('es-ES');
                
                description += `**${userNumber}.** ${user.username} (${user.userId})\n`;
                description += `📅 Baneado: ${bannedDate}\n`;
                description += `⚖️ Por: ${user.bannedBy}\n`;
                description += `📝 Razón: ${user.reason.length > 50 ? user.reason.slice(0, 50) + '...' : user.reason}\n\n`;
            });

            embed.addFields({ name: '👥 Usuarios Baneados', value: description, inline: false });

            // Add navigation info if there are multiple pages
            if (totalPages > 1) {
                embed.addFields({
                    name: '📖 Navegación',
                    value: `Usa \`/banlist pagina:${page + 1}\` para la siguiente página${page > 1 ? `\nUsa \`/banlist pagina:${page - 1}\` para la página anterior` : ''}`,
                    inline: false
                });
            }

            await interaction.editReply({ embeds: [embed] });
            logger.info(`Banlist viewed by ${interaction.user.username} (page ${page})`);

        } catch (error) {
            logger.error('Error in banlist command:', error);
            
            const embed = new EmbedBuilder()
                .setColor(config.COLORS.ERROR)
                .setTitle('❌ Error')
                .setDescription('Ocurrió un error al obtener la lista de baneados.')
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        }
    }
};