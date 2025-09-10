const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Log file paths
const logFile = path.join(logsDir, 'bot.log');
const errorFile = path.join(logsDir, 'error.log');

/**
 * Format timestamp for logs
 * @returns {string} - Formatted timestamp
 */
function getTimestamp() {
    return new Date().toISOString();
}

/**
 * Write log to file
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {string} filePath - File to write to
 */
function writeToFile(level, message, filePath) {
    const timestamp = getTimestamp();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
    
    try {
        fs.appendFileSync(filePath, logEntry);
    } catch (error) {
        console.error('Failed to write to log file:', error);
    }
}

/**
 * Format log arguments
 * @param {...any} args - Arguments to format
 * @returns {string} - Formatted message
 */
function formatMessage(...args) {
    return args.map(arg => {
        if (typeof arg === 'object') {
            return JSON.stringify(arg, null, 2);
        }
        return String(arg);
    }).join(' ');
}

const logger = {
    /**
     * Log info message
     * @param {...any} args - Messages to log
     */
    info(...args) {
        const message = formatMessage(...args);
        console.log(`\x1b[36m[INFO]\x1b[0m ${message}`);
        writeToFile('info', message, logFile);
    },

    /**
     * Log warning message
     * @param {...any} args - Messages to log
     */
    warn(...args) {
        const message = formatMessage(...args);
        console.warn(`\x1b[33m[WARN]\x1b[0m ${message}`);
        writeToFile('warn', message, logFile);
    },

    /**
     * Log error message
     * @param {...any} args - Messages to log
     */
    error(...args) {
        const message = formatMessage(...args);
        console.error(`\x1b[31m[ERROR]\x1b[0m ${message}`);
        writeToFile('error', message, logFile);
        writeToFile('error', message, errorFile);
    },

    /**
     * Log debug message (only in development)
     * @param {...any} args - Messages to log
     */
    debug(...args) {
        if (process.env.NODE_ENV !== 'production') {
            const message = formatMessage(...args);
            console.debug(`\x1b[35m[DEBUG]\x1b[0m ${message}`);
            writeToFile('debug', message, logFile);
        }
    },

    /**
     * Log success message
     * @param {...any} args - Messages to log
     */
    success(...args) {
        const message = formatMessage(...args);
        console.log(`\x1b[32m[SUCCESS]\x1b[0m ${message}`);
        writeToFile('success', message, logFile);
    }
};

// Clean up old log files (keep last 7 days)
function cleanupLogs() {
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    const now = Date.now();
    
    try {
        const files = fs.readdirSync(logsDir);
        
        files.forEach(file => {
            const filePath = path.join(logsDir, file);
            const stats = fs.statSync(filePath);
            
            if (now - stats.mtime.getTime() > maxAge) {
                fs.unlinkSync(filePath);
                logger.info(`Cleaned up old log file: ${file}`);
            }
        });
    } catch (error) {
        logger.error('Error cleaning up logs:', error);
    }
}

// Run cleanup on startup
cleanupLogs();

// Schedule cleanup daily
setInterval(cleanupLogs, 24 * 60 * 60 * 1000);

module.exports = logger;
