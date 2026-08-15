/**
 * careerPath.validation.js
 * -----------------------------------------
 * Zod schemas for Career Path endpoints.
 */

const { z } = require('zod');
const { USER_TYPES } = require('../../config/constants');

const GROWTH_OUTLOOKS = ['high', 'medium', 'low'];
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

const requiredSkillSchema = z.object({
  skillId: objectIdSchema,
  minProficiency: z.coerce.number().int().min(1).max(5),
  weight: z.coerce.number().min(0).max(1),
});

const salaryRangeSchema = z
  .object({
    min: z.coerce.number().min(0).optional(),
    max: z.coerce.number().min(0).optional(),
    currency: z.string().trim().optional(),
  })
  .optional();

const createCareerPathSchema = z.object({
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().min(10).max(2000),
  industry: z.string().trim().optional(),
  requiredSkills: z.array(requiredSkillSchema).min(1, 'At least one required skill is needed'),
  averageSalaryRange: salaryRangeSchema,
  growthOutlook: z.enum(GROWTH_OUTLOOKS).optional(),
  roadmapTemplateRef: z.string().trim().optional(),
  suitableForUserTypes: z.array(z.enum(Object.values(USER_TYPES))).optional().default([]),
});

const updateCareerPathSchema = createCareerPathSchema.partial();

const listCareerPathsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  industry: z.string().trim().optional(),
  suitableForUserType: z.enum(Object.values(USER_TYPES)).optional(),
  q: z.string().trim().optional(),
});

const careerPathIdParamSchema = z.object({
  id: objectIdSchema,
});

const careerPathSlugParamSchema = z.object({
  slug: z.string().trim().min(1),
});

module.exports = {
  createCareerPathSchema,
  updateCareerPathSchema,
  listCareerPathsQuerySchema,
  careerPathIdParamSchema,
  careerPathSlugParamSchema,
};