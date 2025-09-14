const { Client, GatewayIntentBits, Collection, REST, Routes, EmbedBuilder } = require('discord.js');
const express = require('express');
const fs = require('fs');
const path = require('path');
const config = require('./config/config.js');
const logger = require('./utils/logger.js');

// Create Express server for Uptime Robot
const app = express();

app.get('/', (req, res) => {
    res.send('GeminiAIBot está en línea 🤖 | Bot Status: Active');
})

app.get('/status', (req, res) => {
    res.json({
        status: 'online',
        bot: 'GeminiAIBot',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    })
})

// Start Express server on port 5000
app.listen(5000, '0.0.0.0', () => {
    logger.info('Uptime Robot server running on port 5000');
    console.log('Servidor listo en puerto 5000');
})

// Create Discord client with basic intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
})

// Collection to store commands
client.commands = new Collection();

// Load commands from commands directory
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const commands = [];

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
        logger.info(`Loaded command: ${command.data.name}`);
    } else {
        logger.warn(`Command at ${filePath} is missing required "data" or "execute" property.`);
    }
}

// Register slash commands
const rest = new REST().setToken(config.DISCORD_TOKEN);

async function registerCommands() {
    try {
        logger.info('Started refreshing application (/) commands.');
        
        await rest.put(
            Routes.applicationGuildCommands(config.CLIENT_ID, config.GUILD_ID),
            { body: commands },
        );
        
        logger.info('Successfully reloaded application (/) commands.');
 } catch (error) {
  console.error("[ERROR] Error registrando comandos:");
  console.error(error);
  console.error(JSON.stringify(error, null, 2));
}
}(

// Bot ready event
client.once('ready', async () => {
    logger.info(`${client.user.tag} is online and ready!`);
    logger.info(`Serving ${client.guilds.cache.size} guilds with ${client.users.cache.size} users`);
    
    // Set bot status
    client.user.setActivity('Soy GeminiAIBot | /help', { type: 'PLAYING' })
    
    // Register commands
    await registerCommands();
})

// Handle slash command interactions
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        logger.warn(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
        logger.info(`Command ${interaction.commandName} executed by ${interaction.user.tag}`);
    } catch (error) {
        logger.error(`Error executing command ${interaction.commandName}:`, error);
        
        const errorEmbed = new EmbedBuilder()
            .setColor(config.COLORS.ERROR)
            .setTitle('❌ Error')
            .setDescription('There was an error while executing this command!')
            .setTimestamp();

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ embeds: [errorEmbed], ephemeral: true })
        } else {
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true })
        }
    }
})

// Note: Prefix commands require MessageContent intent to be enabled in Discord Developer Portal
// For now, only slash commands are supported

// Handle errors
client.on('error', error => {
    logger.error('Discord client error:', error);
})

process.on('unhandledRejection', error => {
    logger.error('Unhandled promise rejection:', error);
})

process.on('uncaughtException', error => {
    logger.error('Uncaught exception:', error);
    process.exit(1);
})

// Login to Discord
client.login(config.DISCORD_TOKEN).catch(error => {
    logger.error('Failed to login to Discord:', error);
    console.error('Full Discord login error:', error);
});
    if (!config.DISCORD_TOKEN) {
        logger.error('DISCORD_TOKEN is missing or empty');
        console.error('DISCORD_TOKEN is missing or empty');
    } else if (config.DISCORD_TOKEN.length < 50) {
        logger.error('DISCORD_TOKEN appears to be invalid (too short)');
        console.error('DISCORD_TOKEN appears to be invalid (too short)');
    }
    
    process.exit(1);
})

module.exports = client;
