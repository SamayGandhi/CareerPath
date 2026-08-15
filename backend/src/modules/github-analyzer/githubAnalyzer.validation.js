/**
 * githubAnalyzer.validation.js
 * -----------------------------------------
 * Zod schemas for the GitHub Analyzer module.
 */

const { z } = require('zod');

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

const analyzeGithubSchema = z.object({
  githubUsername: z
    .string({ required_error: 'GitHub username is required' })
    .trim()
    .min(1)
    .regex(/^[a-zA-Z0-9-]{1,39}$/, 'Please provide a valid GitHub username'),
});

const listHistoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

const analysisIdParamSchema = z.object({
  analysisId: objectIdSchema,
});

module.exports = {
  analyzeGithubSchema,
  listHistoryQuerySchema,
  analysisIdParamSchema,
};