/**
 * refreshToken.repository.js
 * -----------------------------------------
 * Data-access layer for refresh token persistence, rotation, and
 * revocation (including "revoke entire family" breach-detection logic).
 */

const RefreshToken = require('./refreshToken.model');

class RefreshTokenRepository {
  async create({ userId, tokenHash, deviceInfo, ipAddress, expiresAt }) {
    return RefreshToken.create({ userId, tokenHash, deviceInfo, ipAddress, expiresAt });
  }

  async findByTokenHash(tokenHash) {
    return RefreshToken.findOne({ tokenHash }).exec();
  }

  async revokeById(id) {
    return RefreshToken.findByIdAndUpdate(id, { isRevoked: true }, { new: true }).exec();
  }

  async revokeAllForUser(userId) {
    return RefreshToken.updateMany({ userId, isRevoked: false }, { isRevoked: true }).exec();
  }

  async deleteById(id) {
    return RefreshToken.findByIdAndDelete(id).exec();
  }
}

module.exports = new RefreshTokenRepository();