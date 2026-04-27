const Case = require('../models/case.model');

/**
 * logAction: push an audit log entry into a case and save it.
 * @param {String|ObjectId} caseId
 * @param {String} action
 * @param {Object|null} user - user object (may contain _id, fullName, role)
 * @param {String} message
 */
async function logAction(caseId, action, user = null, message = '') {
    try {
        const caseItem = await Case.findById(caseId);
        if (!caseItem) return null;

        const entry = {
            action,
            performedBy: user && user._id ? user._id : null,
            role: user && user.role ? user.role : (user && user.role === undefined ? 'user' : 'system'),
            message,
            timestamp: new Date()
        };

        // Ensure auditLogs array exists
        if (!Array.isArray(caseItem.auditLogs)) caseItem.auditLogs = [];
        caseItem.auditLogs.push(entry);

        await caseItem.save();
        return entry;
    } catch (error) {
        console.error('Failed to log action:', error);
        return null;
    }
}

module.exports = { logAction };
