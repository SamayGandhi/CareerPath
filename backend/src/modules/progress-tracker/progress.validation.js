/**
 * progress.validation.js
 * -----------------------------------------
 * Zod schemas for the Progress Tracking module.
 */

const { z } = require('zod');

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');
const ACTIVITY_TYPES = ['courseEnrollment', 'courseCompletion', 'projectSubmission', 'skillSelfCheck'];
const PROGRESS_STATUSES = ['notStarted', 'inProgress', 'completed'];

const createProgressSchema = z.object({
  roadmapId: objectIdSchema,
  stageId: z.string().trim().min(1),
  courseId: objectIdSchema.optional(),
  activityType: z.enum(ACTIVITY_TYPES, {
    errorMap: () => ({ message: 'Please provide a valid activity type' }),
  }),
});

const updateProgressSchema = z
  .object({
    status: z.enum(PROGRESS_STATUSES).optional(),
    completionPercentage: z.coerce.number().min(0).max(100).optional(),
  })
  .refine((data) => data.status !== undefined || data.completionPercentage !== undefined, {
    message: 'At least one of status or completionPercentage must be provided',
  });

const listProgressQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  roadmapId: objectIdSchema.optional(),
  status: z.enum(PROGRESS_STATUSES).optional(),
});

const progressIdParamSchema = z.object({
  id: objectIdSchema,
});

const roadmapIdParamSchema = z.object({
  roadmapId: objectIdSchema,
});

module.exports = {
  createProgressSchema,
  updateProgressSchema,
  listProgressQuerySchema,
  progressIdParamSchema,
  roadmapIdParamSchema,
};