/**
 * recommendation.validation.js
 * -----------------------------------------
 * Zod schemas for the Recommendation Engine endpoints.
 */

const { z } = require('zod');

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

const generateRecommendationSchema = z.object({
  skillGapReportId: objectIdSchema,
});

const getHistoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

const recommendationIdParamSchema = z.object({
  id: objectIdSchema,
});

module.exports = {
  generateRecommendationSchema,
  getHistoryQuerySchema,
  recommendationIdParamSchema,
};