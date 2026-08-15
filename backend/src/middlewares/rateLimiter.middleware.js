/**
 * rateLimiter.middleware.js
 * -----------------------------------------
 * Global and specialized rate limiters, per the approved API contract's
 * rate limiting table (Section A.9). Additional stricter limiters for
 * auth/compute-heavy endpoints will be applied at the route level in
 * their respective modules (Phase 1 onward); this file defines the
 * reusable factory + the global default limiter.
 */

const rateLimit = require('express-rate-limit');
const env = require('../config/env.config');
const ApiError = require('../shared/errors/ApiError');

/**
 * Factory to create a rate limiter with consistent error envelope formatting.
 * @param {object} options
 * @param {number} options.windowMs
 * @param {number} options.max
 * @param {string} options.message
 */
function createRateLimiter({ windowMs, max, message = 'Too many requests, please try again later.' }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true, // adds RateLimit-* headers
    legacyHeaders: false,
    handler: (req, res, next) => {
      next(ApiError.tooManyRequests(message));
    },
  });
}

// Global default limiter — applied to all routes in app.js
const globalRateLimiter = createRateLimiter({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  message: 'Too many requests from this client, please try again later.',
});

module.exports = {
  createRateLimiter,
  globalRateLimiter,
};