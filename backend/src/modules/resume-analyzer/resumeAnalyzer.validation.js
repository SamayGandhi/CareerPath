/**
 * resumeAnalyzer.validation.js
 * -----------------------------------------
 * Zod schemas for the Resume Analyzer module. Note: the file itself is
 * validated by upload.middleware.js (MIME type, size) since Zod cannot
 * validate multipart file streams directly — this schema covers the
 * accompanying form fields only.
 */

const { z } = require('zod');

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

const analyzeResumeBodySchema = z.object({
  targetCareerPathId: objectIdSchema.optional(),
});

const listHistoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

const analysisIdParamSchema = z.object({
  analysisId: objectIdSchema,
});

module.exports = {
  analyzeResumeBodySchema,
  listHistoryQuerySchema,
  analysisIdParamSchema,
};