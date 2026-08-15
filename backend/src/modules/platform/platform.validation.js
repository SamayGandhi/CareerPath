/**
 * platform.validation.js
 * -----------------------------------------
 * Zod schemas for Platform endpoints.
 */

const { z } = require('zod');

const PRICING_MODELS = ['subscription', 'payPerCourse', 'freemium', 'free'];
const CERTIFICATION_RECOGNITION_LEVELS = ['high', 'medium', 'low'];
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

const createPlatformSchema = z.object({
  name: z.string().trim().min(2).max(100),
  logoUrl: z.string().trim().url().optional(),
  website: z.string().trim().url().optional(),
  pricingModel: z.enum(PRICING_MODELS, {
    errorMap: () => ({ message: 'Please provide a valid pricing model' }),
  }),
  certificationRecognition: z.enum(CERTIFICATION_RECOGNITION_LEVELS).optional(),
  strengths: z.array(z.string().trim()).optional().default([]),
  weaknesses: z.array(z.string().trim()).optional().default([]),
  supportedLanguages: z.array(z.string().trim()).optional().default(['en']),
});

const updatePlatformSchema = createPlatformSchema.partial();

const listPlatformsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  pricingModel: z.enum(PRICING_MODELS).optional(),
});

const comparePlatformsQuerySchema = z.object({
  ids: z
    .string()
    .transform((val) => val.split(',').map((id) => id.trim()))
    .refine((arr) => arr.length >= 2 && arr.length <= 5, {
      message: 'Please provide between 2 and 5 platform IDs to compare',
    })
    .refine((arr) => arr.every((id) => /^[0-9a-fA-F]{24}$/.test(id)), {
      message: 'One or more platform IDs are invalid',
    }),
});

const platformIdParamSchema = z.object({
  id: objectIdSchema,
});

const platformSlugParamSchema = z.object({
  slug: z.string().trim().min(1),
});

module.exports = {
  createPlatformSchema,
  updatePlatformSchema,
  listPlatformsQuerySchema,
  comparePlatformsQuerySchema,
  platformIdParamSchema,
  platformSlugParamSchema,
};