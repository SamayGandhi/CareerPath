/**
 * cors.config.js
 * -----------------------------------------
 * CORS policy configuration. Restricts cross-origin access to the
 * configured frontend origin(s) only, and explicitly allows credentials
 * since the app uses HttpOnly cookies for refresh tokens.
 */

const env = require('./env.config');

// Supports comma-separated multiple origins in CORS_ORIGIN for staging/prod flexibility
const allowedOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim());

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser tools (curl/Postman) with no origin header, only outside production
    if (!origin && !env.IS_PRODUCTION) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy: origin ${origin} is not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;