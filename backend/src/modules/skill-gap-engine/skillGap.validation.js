/**
 * skillGap.validation.js
 * -----------------------------------------
 * Zod schemas for the Skill Gap Engine endpoints.
 */

const { z } = require('zod');

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

const analyzeSkillGapSchema = z.object({
  targetCareerPathId: objectIdSchema,
});

const getLatestQuerySchema = z.object({
  careerPathId: objectIdSchema.optional(),
});

const getHistoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  careerPathId: objectIdSchema.optional(),
});

const reportIdParamSchema = z.object({
  reportId: objectIdSchema,
});

module.exports = {
  analyzeSkillGapSchema,
  getLatestQuerySchema,
  getHistoryQuerySchema,
  reportIdParamSchema,
};