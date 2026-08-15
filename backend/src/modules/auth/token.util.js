/**
 * token.util.js
 * -----------------------------------------
 * Opaque random token generation/hashing, used for:
 * - Refresh tokens (rotated, stored hashed)
 * - Email verification tokens
 * - Password reset tokens
 *
 * Raw tokens are only ever sent to the client (cookie/email link);
 * only the SHA-256 hash is persisted, so a database leak alone never
 * exposes usable tokens.
 */

const crypto = require('crypto');

function generateRandomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Parses a duration string like '15m', '7d', '1h' into milliseconds.
 * Supports: s (seconds), m (minutes), h (hours), d (days).
 */
function parseExpiryToMs(durationString) {
  const match = /^(\d+)(s|m|h|d)$/.exec(durationString);
  if (!match) {
    throw new Error(`Invalid duration format: ${durationString}`);
  }
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const unitToMs = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return value * unitToMs[unit];
}

module.exports = {
  generateRandomToken,
  hashToken,
  parseExpiryToMs,
};