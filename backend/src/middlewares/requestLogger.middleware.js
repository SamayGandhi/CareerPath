/**
 * requestLogger.middleware.js
 * -----------------------------------------
 * HTTP request logging via morgan, piped into the winston logger so
 * request logs and application logs live in the same rotated files
 * with consistent formatting.
 */

const morgan = require('morgan');
const logger = require('../config/logger.config');

const stream = {
  write: (message) => logger.http ? logger.http(message.trim()) : logger.info(message.trim()),
};

const skip = (req) => {
  // Keep health-check noise out of logs
  return req.originalUrl === '/api/v1/health';
};

const morganFormat = ':method :url :status :res[content-length] - :response-time ms';

const requestLoggerMiddleware = morgan(morganFormat, { stream, skip });

module.exports = requestLoggerMiddleware;