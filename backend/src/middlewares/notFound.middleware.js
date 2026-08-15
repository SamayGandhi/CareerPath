/**
 * notFound.middleware.js
 * -----------------------------------------
 * Catches requests to undefined routes and forwards a standardized
 * 404 ApiError to the global error handler, rather than letting
 * Express return its default HTML 404 page.
 */

const ApiError = require('../shared/errors/ApiError');

function notFoundMiddleware(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`, 'ROUTE_NOT_FOUND'));
}

module.exports = notFoundMiddleware;