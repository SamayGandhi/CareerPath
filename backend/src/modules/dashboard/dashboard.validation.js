/**
 * dashboard.validation.js
 * -----------------------------------------
 * Zod schemas for the Dashboard module.
 */

const { z } = require('zod');

const ANALYTICS_RANGES = ['7d', '30d', '90d', 'all'];

const analyticsQuerySchema = z.object({
  range: z.enum(ANALYTICS_RANGES).optional().default('30d'),
});

module.exports = { analyticsQuerySchema };