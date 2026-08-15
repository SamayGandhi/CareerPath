/**
 * review.validation.js
 * -----------------------------------------
 * Zod schemas for the Reviews module.
 */

const { z } = require('zod');

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');
const TARGET_TYPES = ['course', 'platform'];

const createReviewSchema = z.object({
  targetType: z.enum(TARGET_TYPES, {
    errorMap: () => ({ message: 'targetType must be either "course" or "platform"' }),
  }),
  targetId: objectIdSchema,
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional(),
});

const updateReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5).optional(),
  comment: z.string().trim().max(2000).optional(),
});

const listReviewsQuerySchema = z.object({
  targetType: z.enum(TARGET_TYPES, {
    errorMap: () => ({ message: 'targetType must be either "course" or "platform"' }),
  }),
  targetId: objectIdSchema,
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z.enum(['createdAt', 'rating']).optional().default('createdAt'),
});

const reviewIdParamSchema = z.object({
  id: objectIdSchema,
});

module.exports = {
  createReviewSchema,
  updateReviewSchema,
  listReviewsQuerySchema,
  reviewIdParamSchema,
};