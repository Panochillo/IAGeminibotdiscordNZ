module.exports = {
    // Discord Bot Configuration
    DISCORD_TOKEN: process.env.DISCORD_TOKEN || '',
    CLIENT_ID: process.env.CLIENT_ID || '',
    
    // Gemini AI Configuration
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    
    // Bot Settings
    PREFIX: process.env.BOT_PREFIX || '!',
    
    // Discord Color Scheme
    COLORS: {
        PRIMARY: '#5865F2',    // Discord blurple
        SUCCESS: '#57F287',    // Discord green
        ERROR: '#ED4245',      // Discord red
        WARNING: '#FEE75C',    // Discord yellow
        INFO: '#5865F2',       // Discord blurple
        ACCENT: '#EB459E',     // Discord pink
        BACKGROUND: '#36393F', // Discord dark
        TEXT: '#DCDDDE'        // Discord light text
    },
    
    // Rate Limiting
    RATE_LIMIT: {
        WINDOW_MS: 60000,      // 1 minute
        MAX_REQUESTS: 10       // Max requests per window per user
    },
    
    // File Settings
    MAX_IMAGE_SIZE: 8 * 1024 * 1024, // 8MB
    ALLOWED_IMAGE_TYPES: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    
    // AI Settings
    AI_SETTINGS: {
        MAX_TOKENS: 2048,
        TEMPERATURE: 0.7,
        TOP_P: 0.9
    },
    
    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    
    // Environment
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // Bot Status Messages
    STATUS_MESSAGES: [
        'with Gemini AI | /help',
        'with artificial intelligence',
        '🤖 AI Assistant Ready',
        'Type /help for commands'
    ],
    
    // Error Messages
    ERROR_MESSAGES: {
        NO_PERMISSION: 'You do not have permission to use this command.',
        COOLDOWN: 'Please wait before using this command again.',
        INVALID_INPUT: 'Invalid input provided. Please check your command.',
        API_ERROR: 'External API error occurred. Please try again later.',
        RATE_LIMITED: 'You are being rate limited. Please slow down.',
        MAINTENANCE: 'Bot is currently under maintenance. Please try again later.'
    },
    
    // Feature Flags
    FEATURES: {
        IMAGE_GENERATION: true,
        TEXT_RESPONSES: true,
        SENTIMENT_ANALYSIS: false,
        FILE_UPLOADS: false,
        VOICE_COMMANDS: false
    }
};
