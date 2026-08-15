/**
 * asyncHandler.js
 * -----------------------------------------
 * Wraps async Express route/controller handlers to automatically
 * forward rejected promises to the global error middleware, eliminating
 * repetitive try/catch blocks in every controller (DRY, cleaner code).
 *
 * Usage: router.get('/', asyncHandler(controllerFn));
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;