const config = require('../config/config.js');
const logger = require('./logger.js');

/**
 * Check if a user is an administrator
 * @param {string} userId - Discord user ID
 * @returns {boolean} - True if user is admin
 */
function isAdmin(userId) {
    return config.ADMIN_IDS.includes(userId);
}

/**
 * Check if a user is the bot owner
 * @param {string} userId - Discord user ID
 * @returns {boolean} - True if user is owner
 */
function isOwner(userId) {
    return userId === config.OWNER_ID;
}

/**
 * Check if a user has permission to use admin commands
 * @param {string} userId - Discord user ID
 * @returns {boolean} - True if user has admin permissions
 */
function hasAdminPermission(userId) {
    return isOwner(userId) || isAdmin(userId);
}

/**
 * Get permission level for a user
 * @param {string} userId - Discord user ID
 * @returns {string} - Permission level: 'owner', 'admin', or 'user'
 */
function getPermissionLevel(userId) {
    if (isOwner(userId)) return 'owner';
    if (isAdmin(userId)) return 'admin';
    return 'user';
}

/**
 * Log permission check
 * @param {string} userId - Discord user ID
 * @param {string} command - Command being checked
 * @param {boolean} granted - Whether permission was granted
 */
function logPermissionCheck(userId, command, granted) {
    const level = getPermissionLevel(userId);
    logger.info(`Permission check: ${userId} (${level}) attempted ${command} - ${granted ? 'GRANTED' : 'DENIED'}`);
}

module.exports = {
    isAdmin,
    isOwner,
    hasAdminPermission,
    getPermissionLevel,
    logPermissionCheck
};