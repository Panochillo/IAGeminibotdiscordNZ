module.exports = {
    // Discord Bot Configuration
    DISCORD_TOKEN: process.env.DISCORD_TOKEN || '',
    CLIENT_ID: process.env.CLIENT_ID || '',
    GUILD_ID: process.env.GUILD_ID || '1299431482204360754',
    
    // Gemini AI Configuration
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    
    // Bot Settings
    PREFIX: process.env.BOT_PREFIX || '!',
    
    // Admin Configuration
    OWNER_ID: '1291714952540721172',
    ADMIN_IDS: ['1291714952540721172'], // You can add more admin IDs here
    
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
        NO_PERMISSION: 'No tienes permisos para usar este comando.',
        COOLDOWN: 'Por favor espera antes de usar este comando de nuevo.',
        INVALID_INPUT: 'Entrada inválida. Por favor verifica tu comando.',
        API_ERROR: 'Error de API externa. Por favor intenta más tarde.',
        RATE_LIMITED: 'Estás siendo limitado. Por favor ve más despacio.',
        MAINTENANCE: 'El bot está en mantenimiento. Por favor intenta más tarde.',
        BANNED: 'Estás baneado de usar este bot.',
        USER_NOT_FOUND: 'Usuario no encontrado en la lista de baneados.',
        ALREADY_BANNED: 'Este usuario ya está baneado.',
        BAN_SUCCESS: 'Usuario baneado exitosamente.',
        UNBAN_SUCCESS: 'Usuario desbaneado exitosamente.'
    },
    
    // Ban System Configuration
    BAN_SETTINGS: {
        LOG_ATTEMPTS: true,        // Log banned user attempts
        NOTIFY_ADMINS: false,      // Notify admins when banned users try to use bot
        MAX_REASON_LENGTH: 500     // Maximum characters for ban reason
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
