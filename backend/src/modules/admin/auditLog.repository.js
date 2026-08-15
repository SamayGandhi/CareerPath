/**
 * auditLog.repository.js
 * -----------------------------------------
 * Data-access layer for the AuditLog model. Write-side is intentionally
 * minimal (create only, no update/delete) — audit trails must be
 * append-only to retain integrity.
 */

const AuditLog = require('./auditLog.model');

class AuditLogRepository {
  async create(data) {
    return AuditLog.create(data);
  }

  async findAll({ actorUserId, action, page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = {}) {
    const filter = {};
    if (actorUserId) filter.actorUserId = actorUserId;
    if (action) filter.action = action;

    const sort = { [sortBy]: order === 'asc' ? 1 : -1 };
    const skip = (page - 1) * limit;

    const [items, totalItems] = await Promise.all([
      AuditLog.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('actorUserId', 'fullName email role')
        .exec(),
      AuditLog.countDocuments(filter),
    ]);

    return { items, totalItems };
  }
}

module.exports = new AuditLogRepository();