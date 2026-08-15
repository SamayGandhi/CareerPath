/**
 * error.middleware.js
 * -----------------------------------------
 * Global error-handling middleware. Must be registered LAST in the
 * middleware chain (after all routes). Converts any thrown error —
 * whether a known ApiError or an unexpected exception (Mongoose
 * CastError, JWT error, etc.) — into the standardized error envelope.
 */

const env = require('../config/env.config');
const logger = require('../config/logger.config');
const ApiError = require('../shared/errors/ApiError');

// eslint-disable-next-line no-unused-vars
function errorMiddleware(err, req, res, next) {
  let error = err;

  // Normalize known non-ApiError exceptions into ApiError instances
  if (!(error instanceof ApiError)) {
    // Mongoose invalid ObjectId
    if (error.name === 'CastError') {
      error = ApiError.badRequest(`Invalid ${error.path}: ${error.value}`, 'INVALID_ID_FORMAT');
    }
    // Mongoose duplicate key
    else if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || 'field';
      error = ApiError.conflict(`${field} already exists`, 'DUPLICATE_RESOURCE');
    }
    // Mongoose validation error
    else if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((e) => ({
        field: e.path,
        message: e.message,
      }));
      error = ApiError.badRequest('Validation failed', 'VALIDATION_ERROR', errors);
    }
    // JWT errors
    else if (error.name === 'JsonWebTokenError') {
      error = ApiError.unauthorized('Invalid authentication token', 'INVALID_TOKEN');
    } else if (error.name === 'TokenExpiredError') {
      error = ApiError.unauthorized('Authentication token expired', 'TOKEN_EXPIRED');
    }
    // Fallback: unknown/unexpected error
    else {
      error = ApiError.internal(
        env.IS_PRODUCTION ? 'Internal server error' : error.message || 'Internal server error'
      );
    }
  }

  // Log operational errors at 'warn', programming/unexpected errors at 'error'
  if (error.isOperational) {
    logger.warn(`${req.method} ${req.originalUrl} - ${error.statusCode} - ${error.message}`);
  } else {
    logger.error(`${req.method} ${req.originalUrl} - ${error.statusCode} - ${error.message}`, {
      stack: err.stack,
    });
  }

  const responseBody = {
    success: false,
    statusCode: error.statusCode || 500,
    message: error.message,
    errorCode: error.errorCode || 'INTERNAL_ERROR',
    errors: error.errors || [],
    meta: {
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    },
  };

  // Never leak stack traces to the client in production
  if (!env.IS_PRODUCTION) {
    responseBody.stack = err.stack;
  }

  res.status(error.statusCode || 500).json(responseBody);
}

module.exports = errorMiddleware;