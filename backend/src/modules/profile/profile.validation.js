/**
 * profile.validation.js
 * -----------------------------------------
 * Zod validation schemas for the Profile module, per approved API
 * contract Module 3.
 */

const { z } = require('zod');

const EDUCATION_LEVELS = ['school', 'undergraduate', 'postgraduate', 'graduated', 'none'];
const LEARNING_STYLES = ['video', 'text', 'project-based', 'mixed'];
const BUDGET_PREFERENCES = ['free', 'low', 'medium', 'premium', 'noConstraint'];

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

const createProfileSchema = z.object({
  educationLevel: z.enum(EDUCATION_LEVELS, {
    errorMap: () => ({ message: 'Please provide a valid education level' }),
  }),
  currentRole: z.string().trim().max(150).optional(),
  yearsOfExperience: z.coerce.number().min(0).max(60).optional(),
  interests: z.array(z.string().trim()).optional(),
  preferredLearningStyle: z.enum(LEARNING_STYLES).optional(),
  weeklyTimeCommitmentHours: z.coerce.number().min(1).max(80).optional(),
  budgetPreference: z.enum(BUDGET_PREFERENCES).optional(),
  preferredLanguage: z.string().trim().optional(),
  location: z
    .object({
      country: z.string().trim().optional(),
      state: z.string().trim().optional(),
      city: z.string().trim().optional(),
    })
    .optional(),
});

const updateProfileSchema = createProfileSchema.partial();

const updateTargetCareerPathSchema = z.object({
  careerPathId: objectIdSchema,
});

const updateSkillProficiencySchema = z.object({
  skillId: objectIdSchema,
  proficiency: z.coerce.number().int().min(1).max(5),
});

const userIdParamSchema = z.object({
  userId: objectIdSchema,
});

module.exports = {
  createProfileSchema,
  updateProfileSchema,
  updateTargetCareerPathSchema,
  updateSkillProficiencySchema,
  userIdParamSchema,
};