/**
 * roadmap.validation.js
 * -----------------------------------------
 * Zod schemas for the Roadmap Engine endpoints.
 */

const { z } = require('zod');

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');
const STAGE_STATUSES = ['locked', 'unlocked', 'inProgress', 'completed'];
const ROADMAP_STATUSES = ['notStarted', 'inProgress', 'completed', 'abandoned'];

const generateRoadmapSchema = z.object({
  recommendationId: objectIdSchema,
  force: z.coerce.boolean().optional().default(false),
});

const listRoadmapsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  status: z.enum(ROADMAP_STATUSES).optional(),
});

const roadmapIdParamSchema = z.object({
  id: objectIdSchema,
});

const stageParamSchema = z.object({
  id: objectIdSchema,
  stageId: z.string().trim().min(1),
});

const updateStageStatusSchema = z.object({
  status: z.enum(STAGE_STATUSES, {
    errorMap: () => ({ message: 'Please provide a valid stage status' }),
  }),
});

module.exports = {
  generateRoadmapSchema,
  listRoadmapsQuerySchema,
  roadmapIdParamSchema,
  stageParamSchema,
  updateStageStatusSchema,
};