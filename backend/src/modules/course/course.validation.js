/**
 * course.validation.js
 * -----------------------------------------
 * Zod schemas for Course endpoints.
 */

const { z } = require('zod');
const { USER_TYPES } = require('../../config/constants');

const COURSE_LEVELS = ['beginner', 'intermediate', 'advanced', 'allLevels'];
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

const priceSchema = z.object({
  amount: z.coerce.number().min(0),
  currency: z.string().trim().optional().default('USD'),
  isFree: z.coerce.boolean().optional().default(false),
});

const createCourseSchema = z.object({
  title: z.string().trim().min(2).max(250),
  platformId: objectIdSchema,
  instructor: z.string().trim().optional(),
  description: z.string().trim().min(10).max(3000),
  skillsCovered: z.array(objectIdSchema).min(1, 'At least one skill must be covered'),
  level: z.enum(COURSE_LEVELS, {
    errorMap: () => ({ message: 'Please provide a valid course level' }),
  }),
  durationHours: z.coerce.number().min(0).optional(),
  price: priceSchema,
  certificationOffered: z.coerce.boolean().optional().default(false),
  language: z.string().trim().optional().default('en'),
  externalUrl: z.string().trim().url('Please provide a valid URL'),
  tags: z.array(z.string().trim()).optional().default([]),
  suitableForCareerPathIds: z.array(objectIdSchema).optional().default([]),
  suitableForUserTypes: z.array(z.enum(Object.values(USER_TYPES))).optional().default([]),
});

const updateCourseSchema = createCourseSchema.partial();

const listCoursesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  level: z.enum(COURSE_LEVELS).optional(),
  isFree: z.coerce.boolean().optional(),
  platformId: objectIdSchema.optional(),
  skillId: objectIdSchema.optional(),
  careerPathId: objectIdSchema.optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  sortBy: z.enum(['rating', 'price', 'createdAt', 'enrollmentCount']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

const searchCoursesQuerySchema = z.object({
  q: z.string().trim().min(1, 'Search query is required'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

const courseIdParamSchema = z.object({
  id: objectIdSchema,
});

const courseSlugParamSchema = z.object({
  slug: z.string().trim().min(1),
});

const skillIdParamSchema = z.object({
  skillId: objectIdSchema,
});

const bySkillQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

module.exports = {
  createCourseSchema,
  updateCourseSchema,
  listCoursesQuerySchema,
  searchCoursesQuerySchema,
  courseIdParamSchema,
  courseSlugParamSchema,
  skillIdParamSchema,
  bySkillQuerySchema,
};