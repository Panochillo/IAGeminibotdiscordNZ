const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { askGemini } = require('../utils/gemini.js');
const config = require('../config/config.js');
const logger = require('../utils/logger.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ask')
        .setDescription('Ask Gemini AI a question')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('Your question for Gemini AI')
                .setRequired(true)
                .setMaxLength(2000)
        ),

    async execute(interaction) {
        const question = interaction.options.getString('question');
        
        if (!question || question.trim().length === 0) {
            const embed = new EmbedBuilder()
                .setColor(config.COLORS.ERROR)
                .setTitle('❌ Invalid Question')
                .setDescription('Please provide a valid question!')
                .setTimestamp();
            
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Defer reply as AI responses can take time
        await interaction.deferReply();

        try {
            logger.info(`Processing question from ${interaction.user.tag}: ${question}`);
            
            const response = await askGemini(question);
            
            if (!response || response.trim().length === 0) {
                const embed = new EmbedBuilder()
                    .setColor(config.COLORS.ERROR)
                    .setTitle('❌ Empty Response')
                    .setDescription('Gemini AI returned an empty response. Please try again with a different question.')
                    .setTimestamp();
                
                return interaction.editReply({ embeds: [embed] });
            }

            // Split long responses if needed (Discord embed description limit is 4096 characters)
            const chunks = [];
            if (response.length > 4000) {
                for (let i = 0; i < response.length; i += 4000) {
                    chunks.push(response.slice(i, i + 4000));
                }
            } else {
                chunks.push(response);
            }

            // Send first chunk
            const embed = new EmbedBuilder()
                .setColor(config.COLORS.SUCCESS)
                .setTitle('🤖 GeminiAIBot - Respuesta de IA')
                .setDescription(chunks[0])
                .addFields(
                    { name: '❓ Pregunta', value: question.length > 1000 ? question.slice(0, 1000) + '...' : question, inline: false }
                )
                .setFooter({ text: `Solicitado por ${interaction.user.displayName} • GeminiAIBot` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            // Send additional chunks if needed
            if (chunks.length > 1) {
                for (let i = 1; i < chunks.length; i++) {
                    const continueEmbed = new EmbedBuilder()
                        .setColor(config.COLORS.SUCCESS)
                        .setTitle(`🤖 GeminiAIBot - Respuesta de IA (Parte ${i + 1})`)
                        .setDescription(chunks[i])
                        .setTimestamp();

                    await interaction.followUp({ embeds: [continueEmbed] });
                }
            }

            logger.info(`Successfully responded to question from ${interaction.user.tag}`);

        } catch (error) {
            logger.error('Error processing question:', error);
            
            let errorMessage = 'An unexpected error occurred while processing your question.';
            
            if (error.message.includes('API_KEY')) {
                errorMessage = 'Gemini AI API key is not configured properly.';
            } else if (error.message.includes('quota')) {
                errorMessage = 'API quota exceeded. Please try again later.';
            } else if (error.message.includes('safety')) {
                errorMessage = 'Your question was blocked by content safety filters. Please try a different question.';
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                errorMessage = 'Network error occurred. Please try again later.';
            }

            const embed = new EmbedBuilder()
                .setColor(config.COLORS.ERROR)
                .setTitle('❌ Error Processing Question')
                .setDescription(errorMessage)
                .addFields(
                    { name: '🔧 Troubleshooting', value: 'If this error persists, please contact the bot administrator.', inline: false }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        }
    }
};
