/**
 * portfolioAnalyzer.validation.js
 * -----------------------------------------
 * Zod schemas for the Portfolio Analyzer module.
 */

const { z } = require('zod');

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

const analyzePortfolioSchema = z.object({
  portfolioUrl: z
    .string({ required_error: 'Portfolio URL is required' })
    .trim()
    .url('Please provide a valid URL'),
});

const listHistoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

const analysisIdParamSchema = z.object({
  analysisId: objectIdSchema,
});

module.exports = {
  analyzePortfolioSchema,
  listHistoryQuerySchema,
  analysisIdParamSchema,
};