/**
 * jwt.util.js
 * -----------------------------------------
 * Access token (JWT) signing and verification. Refresh tokens are NOT
 * JWTs — they are opaque random strings (see token.util.js) stored
 * hashed in the database, which allows true server-side revocation
 * (a stateless JWT refresh token cannot be revoked before its natural
 * expiry without a blocklist, which is more complex than this approach).
 */

const jwt = require('jsonwebtoken');
const env = require('../../config/env.config');

/**
 * Signs a short-lived access token carrying minimal, non-sensitive claims.
 * @param {{ id: string, role: string, userType: string }} payload
 */
function signAccessToken(payload) {
  return jwt.sign(
    { sub: payload.id, role: payload.role, userType: payload.userType },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRY }
  );
}

/**
 * Verifies and decodes an access token. Throws JsonWebTokenError /
 * TokenExpiredError on failure — these are normalized by the global
 * error middleware into proper ApiError responses.
 */
function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
};