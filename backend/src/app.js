/**
 * app.js
 * -----------------------------------------
 * Express application setup: security middlewares, body parsing,
 * CORS, rate limiting, route mounting, and error handling.
 * Exported as a plain Express app (no listen() here) so it can be
 * imported directly in tests (via supertest) without starting a real server.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');

const env = require('./config/env.config');
const corsOptions = require('./config/cors.config');
const requestLoggerMiddleware = require('./middlewares/requestLogger.middleware');
const { globalRateLimiter } = require('./middlewares/rateLimiter.middleware');
const notFoundMiddleware = require('./middlewares/notFound.middleware');
const errorMiddleware = require('./middlewares/error.middleware');
const routes = require('./routes/index');

const app = express();

// -----------------------------------------------------------------------
// Security Middlewares (registered first, before any body parsing)
// -----------------------------------------------------------------------
app.use(helmet());
app.use(cors(corsOptions));

// -----------------------------------------------------------------------
// Body Parsing
// -----------------------------------------------------------------------
app.use(express.json({ limit: '10kb' })); // small limit — large payloads (files) use multipart, handled per-route
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// -----------------------------------------------------------------------
// Data Sanitization (prevents NoSQL injection & XSS)
// -----------------------------------------------------------------------
app.use(mongoSanitize());
app.use(xssClean());
app.use(hpp());

// -----------------------------------------------------------------------
// Request Logging
// -----------------------------------------------------------------------
app.use(requestLoggerMiddleware);

// -----------------------------------------------------------------------
// Global Rate Limiting (route-specific stricter limits applied later
// at the module level, e.g. auth login/register)
// -----------------------------------------------------------------------
app.use(globalRateLimiter);

// -----------------------------------------------------------------------
// Trust proxy — required for correct client IP detection (rate limiting,
// logging) when running behind a reverse proxy / load balancer in production
// -----------------------------------------------------------------------
if (env.IS_PRODUCTION) {
  app.set('trust proxy', 1);
}

// -----------------------------------------------------------------------
// API Routes (versioned)
// -----------------------------------------------------------------------
app.use(`/api/${env.API_VERSION}`, routes);

// -----------------------------------------------------------------------
// 404 + Global Error Handling (must be registered last, in this order)
// -----------------------------------------------------------------------
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;