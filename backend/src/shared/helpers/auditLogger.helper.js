/**
 * auditLogger.helper.js
 * -----------------------------------------
 * Shared, reusable helper for recording an audit log entry from any
 * module's service layer — avoids every module needing to import the
 * Admin module's repository directly (which would create awkward
 * reverse dependencies from "core" modules back into the Admin module).
 * Failures here are swallowed (logged, not thrown) since a failed audit
 * write must never block the actual user-facing action it's recording.
 */

const auditLogRepository = require('../../modules/admin/auditLog.repository');
const logger = require('../../config/logger.config');

/**
 * @param {object} params
 * @param {string} params.actorUserId
 * @param {string} params.action - e.g. 'USER_ROLE_CHANGED', 'COURSE_DELETED'
 * @param {string} [params.targetEntityType]
 * @param {string} [params.targetEntityId]
 * @param {object} [params.metadata]
 * @param {string} [params.ipAddress]
 */
async function recordAuditLog({ actorUserId, action, targetEntityType, targetEntityId, metadata, ipAddress }) {
  try {
    await auditLogRepository.create({
      actorUserId,
      action,
      targetEntityType,
      targetEntityId,
      metadata,
      ipAddress,
    });
  } catch (error) {
    logger.error(`Failed to write audit log for action "${action}": ${error.message}`);
  }
}

module.exports = { recordAuditLog };