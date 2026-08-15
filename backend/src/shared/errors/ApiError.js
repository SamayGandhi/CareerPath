/**
 * ApiError.js
 * -----------------------------------------
 * Custom application error class. All deliberate, expected error
 * conditions throughout the app (validation failures, not-found,
 * unauthorized, etc.) should throw an ApiError instance rather than
 * a generic Error, so the global error middleware can distinguish
 * "operational" errors (safe to expose to the client) from unexpected
 * programming errors.
 */

class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Human-readable error message
   * @param {string} errorCode - Machine-readable error code (e.g. VALIDATION_ERROR)
   * @param {Array<{field: string, message: string}>} errors - Field-level error details
   * @param {boolean} isOperational - Whether this is a known/expected error
   */
  constructor(
    statusCode,
    message,
    errorCode = 'INTERNAL_ERROR',
    errors = [],
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, errorCode = 'BAD_REQUEST', errors = []) {
    return new ApiError(400, message, errorCode, errors);
  }

  static unauthorized(message = 'Unauthorized', errorCode = 'UNAUTHORIZED') {
    return new ApiError(401, message, errorCode);
  }

  static forbidden(message = 'Forbidden', errorCode = 'FORBIDDEN') {
    return new ApiError(403, message, errorCode);
  }

  static notFound(message = 'Resource not found', errorCode = 'NOT_FOUND') {
    return new ApiError(404, message, errorCode);
  }

  static conflict(message = 'Resource conflict', errorCode = 'CONFLICT') {
    return new ApiError(409, message, errorCode);
  }

  static unprocessable(message = 'Unprocessable entity', errorCode = 'UNPROCESSABLE_ENTITY') {
    return new ApiError(422, message, errorCode);
  }

  static tooManyRequests(message = 'Too many requests', errorCode = 'RATE_LIMIT_EXCEEDED') {
    return new ApiError(429, message, errorCode);
  }

  static internal(message = 'Internal server error', errorCode = 'INTERNAL_ERROR') {
    return new ApiError(500, message, errorCode, [], false);
  }

  static serviceUnavailable(message = 'Service unavailable', errorCode = 'SERVICE_UNAVAILABLE') {
    return new ApiError(503, message, errorCode);
  }
}

module.exports = ApiError;