/**
 * admin.validation.js
 * -----------------------------------------
 * Zod schemas for the Admin Panel module.
 */

const { z } = require('zod');

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

const auditLogsQuerySchema = z.object({
  actorUserId: objectIdSchema.optional(),
  action: z.string().trim().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z.enum(['createdAt']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

const updateFeatureFlagSchema = z.object({
  key: z.string().trim().min(1),
  enabled: z.boolean({ required_error: 'enabled must be a boolean' }),
});

const aiLogsQuerySchema = z.object({
  status: z.string().trim().optional(),
  provider: z.string().trim().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

module.exports = {
  auditLogsQuerySchema,
  updateFeatureFlagSchema,
  aiLogsQuerySchema,
};