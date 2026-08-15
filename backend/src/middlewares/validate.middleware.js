/**
 * validate.middleware.js
 * -----------------------------------------
 * Generic request-validation middleware factory using Zod schemas.
 * Validates the specified request part (body/query/params), and on
 * failure throws a standardized ApiError with field-level details —
 * ensuring invalid data never reaches controllers/services (fail fast).
 */

const ApiError = require('../shared/errors/ApiError');

/**
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'query'|'params'} source
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return next(ApiError.badRequest('Validation failed', 'VALIDATION_ERROR', errors));
    }

    req[source] = result.data;
    next();
  };
}

module.exports = validate;