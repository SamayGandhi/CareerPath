/**
 * skillTaxonomy.validation.js
 * -----------------------------------------
 * Zod schemas for Skill Taxonomy endpoints.
 */

const { z } = require('zod');

const SKILL_CATEGORIES = [
  'programming',
  'dataScience',
  'design',
  'softSkill',
  'tool',
  'domainKnowledge',
  'marketing',
  'business',
  'other',
];
const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'];

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

const createSkillSchema = z.object({
  skillName: z.string().trim().min(2).max(150),
  category: z.enum(SKILL_CATEGORIES, {
    errorMap: () => ({ message: 'Please provide a valid skill category' }),
  }),
  description: z.string().trim().max(1000).optional(),
  prerequisiteSkillIds: z.array(objectIdSchema).optional().default([]),
  relatedCareerPathIds: z.array(objectIdSchema).optional().default([]),
  difficultyLevel: z.enum(DIFFICULTY_LEVELS, {
    errorMap: () => ({ message: 'Please provide a valid difficulty level' }),
  }),
});

const updateSkillSchema = createSkillSchema.partial();

const listSkillsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  category: z.enum(SKILL_CATEGORIES).optional(),
  q: z.string().trim().optional(),
});

const skillIdParamSchema = z.object({
  id: objectIdSchema,
});

const skillSlugParamSchema = z.object({
  slug: z.string().trim().min(1),
});

module.exports = {
  createSkillSchema,
  updateSkillSchema,
  listSkillsQuerySchema,
  skillIdParamSchema,
  skillSlugParamSchema,
};