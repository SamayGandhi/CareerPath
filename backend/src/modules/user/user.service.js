/**
 * user.service.js
 * -----------------------------------------
 * Business logic for user self-service and admin user management.
 * UPDATED (Phase 18): adminUpdateUser() now records an audit log entry
 * whenever an admin changes another user's role or account status —
 * a genuinely sensitive action that must be traceable.
 */

const ApiError = require('../../shared/errors/ApiError');
const userRepository = require('./user.repository');
const refreshTokenRepository = require('../auth/refreshToken.repository');
const { recordAuditLog } = require('../../shared/helpers/auditLogger.helper');
const { ACCOUNT_STATUS, PAGINATION_DEFAULTS } = require('../../config/constants');

class UserService {
  async getById(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
    }
    return user.toSafeObject();
  }

  async updateMe(userId, updateData) {
    const user = await userRepository.updateById(userId, updateData);
    if (!user) {
      throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
    }
    return user.toSafeObject();
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await userRepository.findById(userId, { includePassword: true });
    if (!user) {
      throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw ApiError.unauthorized('Current password is incorrect', 'CURRENT_PASSWORD_INCORRECT');
    }

    user.passwordHash = newPassword;
    await user.save();

    await refreshTokenRepository.revokeAllForUser(user._id);
  }

  async deleteMe(userId, password) {
    const user = await userRepository.findById(userId, { includePassword: true });
    if (!user) {
      throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Password is incorrect', 'INVALID_CREDENTIALS');
    }

    user.accountStatus = ACCOUNT_STATUS.DELETED;
    await user.save();

    await refreshTokenRepository.revokeAllForUser(user._id);
  }

  async listUsers(query) {
    const { page, limit, role, userType, accountStatus, q } = query;

    const filter = {};
    if (role) filter.role = role;
    if (userType) filter.userType = userType;
    if (accountStatus) filter.accountStatus = accountStatus;
    if (q) {
      filter.$or = [
        { fullName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }

    const { items, totalItems } = await userRepository.findAll({
      filter,
      page: page || PAGINATION_DEFAULTS.DEFAULT_PAGE,
      limit: limit || PAGINATION_DEFAULTS.DEFAULT_LIMIT,
    });

    return {
      items: items.map((u) => u.toSafeObject()),
      pagination: this._buildPagination(page, limit, totalItems),
    };
  }

  async adminGetUserById(userId) {
    return this.getById(userId);
  }

  /**
   * Now accepts the acting admin's ID + IP so the change can be
   * recorded in the audit trail — a role/status change is exactly the
   * kind of sensitive action the approved architecture requires be
   * auditable.
   */
  async adminUpdateUser(userId, updateData, actorContext) {
    const beforeUser = await userRepository.findById(userId);
    if (!beforeUser) {
      throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
    }

    const user = await userRepository.updateById(userId, updateData);

    if (updateData.accountStatus && updateData.accountStatus !== ACCOUNT_STATUS.ACTIVE) {
      await refreshTokenRepository.revokeAllForUser(user._id);
    }

    if (actorContext) {
      await recordAuditLog({
        actorUserId: actorContext.actorUserId,
        action: 'USER_ROLE_OR_STATUS_CHANGED',
        targetEntityType: 'User',
        targetEntityId: user._id,
        metadata: {
          before: { role: beforeUser.role, accountStatus: beforeUser.accountStatus },
          after: { role: user.role, accountStatus: user.accountStatus },
        },
        ipAddress: actorContext.ipAddress,
      });
    }

    return user.toSafeObject();
  }

  _buildPagination(page, limit, totalItems) {
    return {
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
    };
  }
}

module.exports = new UserService();