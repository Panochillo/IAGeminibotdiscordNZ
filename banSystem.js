const fs = require('fs');
const path = require('path');
const logger = require('./logger.js');

const BANNED_USERS_FILE = path.join(__dirname, '..', 'data', 'banned_users.json');

/**
 * Get the list of banned users
 * @returns {Array} - Array of banned user objects
 */
function getBannedUsers() {
    try {
        if (!fs.existsSync(BANNED_USERS_FILE)) {
            return [];
        }
        const data = fs.readFileSync(BANNED_USERS_FILE, 'utf8');
        return JSON.parse(data) || [];
    } catch (error) {
        logger.error('Error reading banned users file:', error);
        return [];
    }
}

/**
 * Save the banned users list to file
 * @param {Array} bannedUsers - Array of banned user objects
 */
function saveBannedUsers(bannedUsers) {
    try {
        const dataDir = path.dirname(BANNED_USERS_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(BANNED_USERS_FILE, JSON.stringify(bannedUsers, null, 2));
        logger.info('Banned users list updated');
    } catch (error) {
        logger.error('Error saving banned users file:', error);
    }
}

/**
 * Check if a user is banned
 * @param {string} userId - Discord user ID
 * @returns {Object|null} - Banned user object or null if not banned
 */
function isBanned(userId) {
    const bannedUsers = getBannedUsers();
    return bannedUsers.find(user => user.userId === userId) || null;
}

/**
 * Ban a user
 * @param {string} userId - Discord user ID
 * @param {string} username - Discord username
 * @param {string} reason - Reason for the ban
 * @param {string} bannedBy - Admin who banned the user
 * @returns {boolean} - Success status
 */
function banUser(userId, username, reason = 'No reason provided', bannedBy) {
    try {
        const bannedUsers = getBannedUsers();
        
        // Check if user is already banned
        if (isBanned(userId)) {
            return false; // User already banned
        }
        
        const banEntry = {
            userId: userId,
            username: username,
            reason: reason,
            bannedBy: bannedBy,
            bannedAt: new Date().toISOString()
        };
        
        bannedUsers.push(banEntry);
        saveBannedUsers(bannedUsers);
        
        logger.info(`User ${username} (${userId}) banned by ${bannedBy}. Reason: ${reason}`);
        return true;
    } catch (error) {
        logger.error('Error banning user:', error);
        return false;
    }
}

/**
 * Unban a user
 * @param {string} userId - Discord user ID
 * @param {string} unbannedBy - Admin who unbanned the user
 * @returns {boolean} - Success status
 */
function unbanUser(userId, unbannedBy) {
    try {
        const bannedUsers = getBannedUsers();
        const userIndex = bannedUsers.findIndex(user => user.userId === userId);
        
        if (userIndex === -1) {
            return false; // User not found in ban list
        }
        
        const unbannedUser = bannedUsers[userIndex];
        bannedUsers.splice(userIndex, 1);
        saveBannedUsers(bannedUsers);
        
        logger.info(`User ${unbannedUser.username} (${userId}) unbanned by ${unbannedBy}`);
        return true;
    } catch (error) {
        logger.error('Error unbanning user:', error);
        return false;
    }
}

/**
 * Get ban statistics
 * @returns {Object} - Ban statistics
 */
function getBanStats() {
    const bannedUsers = getBannedUsers();
    return {
        totalBanned: bannedUsers.length,
        recentBans: bannedUsers.slice(-5).reverse() // Last 5 bans
    };
}

module.exports = {
    getBannedUsers,
    isBanned,
    banUser,
    unbanUser,
    getBanStats
};