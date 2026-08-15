/**
 * password.util.js
 * -----------------------------------------
 * Standalone password hashing/verification utilities, used outside the
 * User model context (e.g., validating password strength before it
 * ever reaches the model's pre-save hook).
 */

const bcrypt = require('bcryptjs');

const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

/**
 * Validates password strength: minimum 8 characters, at least one
 * number, and at least one special character.
 */
function isPasswordStrong(password) {
  return PASSWORD_REGEX.test(password);
}

async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plainPassword, salt);
}

async function comparePassword(plainPassword, hash) {
  return bcrypt.compare(plainPassword, hash);
}

module.exports = {
  isPasswordStrong,
  hashPassword,
  comparePassword,
  PASSWORD_REGEX,
};