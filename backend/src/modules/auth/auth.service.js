/**
 * auth.service.js
 * -----------------------------------------
 * All authentication business logic/orchestration. Controllers stay
 * thin and call these methods; this layer talks to repositories and
 * utilities only — never directly to Express req/res.
 */

const ApiError = require('../../shared/errors/ApiError');
const userRepository = require('../user/user.repository');
const refreshTokenRepository = require('./refreshToken.repository');
const jwtUtil = require('./jwt.util');
const tokenUtil = require('./token.util');
const emailUtil = require('../../shared/utils/email.util');
const { ACCOUNT_STATUS, AUTH_PROVIDERS } = require('../../config/constants');
const env = require('../../config/env.config');

const EMAIL_VERIFICATION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

class AuthService {
  /**
   * Registers a new user, issues an email verification token, and
   * returns tokens so the user is immediately logged in.
   */
  async register({ fullName, email, password, userType }, requestMeta) {
    const alreadyExists = await userRepository.existsByEmail(email);
    if (alreadyExists) {
      throw ApiError.conflict('An account with this email already exists', 'EMAIL_ALREADY_EXISTS');
    }

    const rawVerificationToken = tokenUtil.generateRandomToken();
    const verificationTokenHash = tokenUtil.hashToken(rawVerificationToken);

    const user = await userRepository.create({
      fullName,
      email,
      passwordHash: password, // hashed by the model's pre-save hook
      authProvider: AUTH_PROVIDERS.LOCAL,
      userType,
      emailVerificationTokenHash: verificationTokenHash,
      emailVerificationExpires: new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY_MS),
    });

    // Fire-and-forget-safe: email failure must never block registration
    await emailUtil.sendVerificationEmail(user.email, rawVerificationToken);

    const tokens = await this._issueTokenPair(user, requestMeta);

    return { user: user.toSafeObject(), ...tokens };
  }

  /**
   * Validates credentials and issues a new token pair.
   */
  async login({ email, password }, requestMeta) {
    const user = await userRepository.findByEmail(email, { includePassword: true });

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    if (user.accountStatus === ACCOUNT_STATUS.SUSPENDED) {
      throw ApiError.forbidden('This account has been suspended', 'ACCOUNT_SUSPENDED');
    }

    if (user.accountStatus === ACCOUNT_STATUS.DELETED) {
      throw ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    user.lastLoginAt = new Date();
    await user.save();

    const tokens = await this._issueTokenPair(user, requestMeta);

    return { user: user.toSafeObject(), ...tokens };
  }

  /**
   * Rotates a refresh token: validates the incoming raw token, detects
   * reuse of an already-revoked token (breach signal → revoke entire
   * family), and issues a brand new access + refresh token pair.
   */
  async refreshToken(rawRefreshToken, requestMeta) {
    if (!rawRefreshToken) {
      throw ApiError.unauthorized('Refresh token missing', 'REFRESH_TOKEN_MISSING');
    }

    const tokenHash = tokenUtil.hashToken(rawRefreshToken);
    const storedToken = await refreshTokenRepository.findByTokenHash(tokenHash);

    if (!storedToken) {
      throw ApiError.unauthorized('Invalid refresh token', 'REFRESH_TOKEN_INVALID');
    }

    if (storedToken.isRevoked) {
      // Reuse of a rotated-out token — possible theft. Revoke the entire
      // token family for this user as a breach-containment measure.
      await refreshTokenRepository.revokeAllForUser(storedToken.userId);
      throw ApiError.unauthorized(
        'Refresh token has already been used. All sessions have been revoked for security.',
        'REFRESH_TOKEN_REUSE_DETECTED'
      );
    }

    if (storedToken.expiresAt < new Date()) {
      throw ApiError.unauthorized('Refresh token expired', 'REFRESH_TOKEN_EXPIRED');
    }

    const user = await userRepository.findById(storedToken.userId);
    if (!user || user.accountStatus !== ACCOUNT_STATUS.ACTIVE) {
      throw ApiError.unauthorized('Account is not active', 'ACCOUNT_NOT_ACTIVE');
    }

    // Rotate: revoke the used token, issue a fresh pair
    await refreshTokenRepository.revokeById(storedToken._id);
    const tokens = await this._issueTokenPair(user, requestMeta);

    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  }

  async logout(rawRefreshToken) {
    if (!rawRefreshToken) return;
    const tokenHash = tokenUtil.hashToken(rawRefreshToken);
    const storedToken = await refreshTokenRepository.findByTokenHash(tokenHash);
    if (storedToken) {
      await refreshTokenRepository.revokeById(storedToken._id);
    }
  }

  async logoutAll(userId) {
    await refreshTokenRepository.revokeAllForUser(userId);
  }

  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);

    // Always respond generically regardless of whether the user exists,
    // to prevent email enumeration attacks — handled by controller.
    if (!user) return;

    const rawResetToken = tokenUtil.generateRandomToken();
    user.passwordResetTokenHash = tokenUtil.hashToken(rawResetToken);
    user.passwordResetExpires = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS);
    await user.save();

    await emailUtil.sendPasswordResetEmail(user.email, rawResetToken);
  }

  async resetPassword(rawToken, newPassword) {
    const tokenHash = tokenUtil.hashToken(rawToken);
    const user = await userRepository.findByPasswordResetTokenHash(tokenHash);

    if (!user) {
      throw ApiError.badRequest('Invalid or expired reset token', 'INVALID_OR_EXPIRED_TOKEN');
    }

    user.passwordHash = newPassword; // re-hashed by pre-save hook
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Invalidate all existing sessions on password change — critical
    // security practice, prevents a stolen session from surviving a reset.
    await refreshTokenRepository.revokeAllForUser(user._id);
  }

  async verifyEmail(rawToken) {
    const tokenHash = tokenUtil.hashToken(rawToken);
    const user = await userRepository.findByEmailVerificationTokenHash(tokenHash);

    if (!user) {
      throw ApiError.badRequest('Invalid or expired verification token', 'INVALID_TOKEN');
    }

    user.isEmailVerified = true;
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return user.toSafeObject();
  }

  async resendVerification(email) {
    const user = await userRepository.findByEmail(email);
    if (!user || user.isEmailVerified) return;

    const rawVerificationToken = tokenUtil.generateRandomToken();
    user.emailVerificationTokenHash = tokenUtil.hashToken(rawVerificationToken);
    user.emailVerificationExpires = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY_MS);
    await user.save();

    await emailUtil.sendVerificationEmail(user.email, rawVerificationToken);
  }

  /**
   * Internal helper: issues a new access token (JWT) + refresh token
   * (opaque, persisted hashed) pair for a given user.
   */
  async _issueTokenPair(user, requestMeta = {}) {
    const accessToken = jwtUtil.signAccessToken({
      id: user._id.toString(),
      role: user.role,
      userType: user.userType,
    });

    const rawRefreshToken = tokenUtil.generateRandomToken();
    const refreshTokenHash = tokenUtil.hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + tokenUtil.parseExpiryToMs(env.JWT_REFRESH_EXPIRY));

    await refreshTokenRepository.create({
      userId: user._id,
      tokenHash: refreshTokenHash,
      deviceInfo: requestMeta.deviceInfo,
      ipAddress: requestMeta.ipAddress,
      expiresAt,
    });

    return { accessToken, refreshToken: rawRefreshToken };
  }
}

module.exports = new AuthService();