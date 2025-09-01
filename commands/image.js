const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { generateImage } = require('../utils/gemini.js');
const config = require('../config/config.js');
const logger = require('../utils/logger.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('image')
        .setDescription('Generate an image using Gemini AI')
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('Description of the image you want to generate')
                .setRequired(true)
                .setMaxLength(1000)
        ),

    async execute(interaction) {
        const prompt = interaction.options.getString('prompt');
        
        if (!prompt || prompt.trim().length === 0) {
            const embed = new EmbedBuilder()
                .setColor(config.COLORS.ERROR)
                .setTitle('❌ Invalid Prompt')
                .setDescription('Please provide a valid image description!')
                .setTimestamp();
            
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Check for inappropriate content in prompt
        const inappropriateKeywords = ['nsfw', 'nude', 'explicit', 'gore', 'violence', 'hate'];
        const lowerPrompt = prompt.toLowerCase();
        
        if (inappropriateKeywords.some(keyword => lowerPrompt.includes(keyword))) {
            const embed = new EmbedBuilder()
                .setColor(config.COLORS.ERROR)
                .setTitle('❌ Inappropriate Content')
                .setDescription('Your prompt contains inappropriate content. Please try a different description.')
                .setTimestamp();
            
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Defer reply as image generation can take time
        await interaction.deferReply();

        const tempDir = path.join(__dirname, '..', 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const fileName = `generated_${Date.now()}_${interaction.user.id}.png`;
        const filePath = path.join(tempDir, fileName);

        try {
            logger.info(`Generating image for ${interaction.user.tag}: ${prompt}`);
            
            await generateImage(prompt, filePath);
            
            // Check if file was created successfully
            if (!fs.existsSync(filePath)) {
                const embed = new EmbedBuilder()
                    .setColor(config.COLORS.ERROR)
                    .setTitle('❌ Image Generation Failed')
                    .setDescription('Failed to generate image. The prompt might be blocked by content filters or there was a service error.')
                    .addFields(
                        { name: '💡 Tips', value: 'Try being more specific or using different keywords in your prompt.', inline: false }
                    )
                    .setTimestamp();
                
                return interaction.editReply({ embeds: [embed] });
            }

            // Create attachment
            const attachment = new AttachmentBuilder(filePath, { name: fileName });
            
            const embed = new EmbedBuilder()
                .setColor(config.COLORS.SUCCESS)
                .setTitle('🎨 GeminiAIBot - Imagen Generada!')
                .setDescription(`Aquí está tu imagen generada: "${prompt}"`)
                .setImage(`attachment://${fileName}`)
                .addFields(
                    { name: '📝 Descripción', value: prompt.length > 1000 ? prompt.slice(0, 1000) + '...' : prompt, inline: false }
                )
                .setFooter({ text: `Generado para ${interaction.user.displayName} • GeminiAIBot` })
                .setTimestamp();

            await interaction.editReply({ 
                embeds: [embed], 
                files: [attachment] 
            });

            logger.info(`Successfully generated image for ${interaction.user.tag}`);

            // Clean up temporary file after a delay
            setTimeout(() => {
                try {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                        logger.info(`Cleaned up temporary file: ${fileName}`);
                    }
                } catch (cleanupError) {
                    logger.warn(`Failed to cleanup temporary file ${fileName}:`, cleanupError);
                }
            }, 60000); // Delete after 1 minute

        } catch (error) {
            logger.error('Error generating image:', error);
            
            // Clean up any partial file
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (cleanupError) {
                logger.warn('Failed to cleanup partial file:', cleanupError);
            }
            
            let errorMessage = 'An unexpected error occurred while generating your image.';
            
            if (error.message.includes('API_KEY')) {
                errorMessage = 'Gemini AI API key is not configured properly.';
            } else if (error.message.includes('quota')) {
                errorMessage = 'API quota exceeded. Please try again later.';
            } else if (error.message.includes('safety') || error.message.includes('blocked')) {
                errorMessage = 'Your prompt was blocked by content safety filters. Please try a different description.';
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                errorMessage = 'Network error occurred. Please try again later.';
            } else if (error.message.includes('model')) {
                errorMessage = 'Image generation model is currently unavailable. Please try again later.';
            }

            const embed = new EmbedBuilder()
                .setColor(config.COLORS.ERROR)
                .setTitle('❌ Image Generation Failed')
                .setDescription(errorMessage)
                .addFields(
                    { name: '🔧 Troubleshooting', value: 'If this error persists, please contact the bot administrator.', inline: false },
                    { name: '💡 Tips', value: 'Try being more specific or using different keywords in your prompt.', inline: false }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        }
    }
};
