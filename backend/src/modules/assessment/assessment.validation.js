/**
 * assessment.validation.js
 * -----------------------------------------
 * Zod schemas for the Skill Assessment module.
 * UPDATED (Batch 5.1 — smarter assessment): getQuestionsQuerySchema
 * gains two OPTIONAL params, careerPathId and limit. Both are
 * additive — any existing caller sending only `type` is completely
 * unaffected, satisfying full backward compatibility.
 */

const { z } = require('zod');

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');
const ASSESSMENT_TYPES = ['initialOnboarding', 'periodicReassessment', 'skillSpecificQuiz'];

const getQuestionsQuerySchema = z.object({
  type: z.enum(ASSESSMENT_TYPES).optional().default('initialOnboarding'),
  careerPathId: objectIdSchema.optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
});

const answerItemSchema = z.object({
  questionId: objectIdSchema,
  answer: z.union([z.number(), z.string(), z.boolean()]),
});

const submitAssessmentSchema = z.object({
  assessmentType: z.enum(ASSESSMENT_TYPES),
  responses: z
    .array(answerItemSchema)
    .min(1, 'At least one response is required'),
});

const listAssessmentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

const assessmentIdParamSchema = z.object({
  assessmentId: objectIdSchema,
});

module.exports = {
  getQuestionsQuerySchema,
  submitAssessmentSchema,
  listAssessmentsQuerySchema,
  assessmentIdParamSchema,
};