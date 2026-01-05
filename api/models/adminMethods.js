const { AdminAudit } = require('~/db/models');
const logger = require('~/config/winston');

/**
 * Logs an administrative action
 * @param {Object} params
 * @param {string} params.userId - The ID of the admin performing the action
 * @param {string} params.action - The action performed (e.g., 'CREATE_QUOTA_PROFILE')
 * @param {string} [params.target] - The target of the action (e.g., profile ID)
 * @param {Object} [params.metadata] - Additional metadata for the action
 */
const logAdminAction = async ({ userId, action, target, metadata }) => {
    try {
        await AdminAudit.create({
            user: userId,
            action,
            target,
            metadata,
        });
    } catch (error) {
        logger.error('[logAdminAction] Error logging admin action:', error);
    }
};

module.exports = {
    logAdminAction,
};
