/**
 * interviewPrep.validation.js
 * -----------------------------------------
 * Zod schemas for the Interview Preparation module.
 */

const { z } = require('zod');

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');
const QUESTION_TYPES = ['mcq', 'descriptive', 'coding', 'behavioral'];
const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];

const getPracticeQuestionsQuerySchema = z.object({
  careerPathId: objectIdSchema.optional(),
  skillId: objectIdSchema.optional(),
  difficulty: z.enum(DIFFICULTY_LEVELS).optional(),
  type: z.enum(QUESTION_TYPES).optional(),
  limit: z.coerce.number().int().positive().max(50).optional().default(20),
});

const startMockTestSchema = z.object({
  careerPathId: objectIdSchema.optional(),
  difficulty: z.enum(DIFFICULTY_LEVELS).optional(),
  questionCount: z.coerce.number().int().min(1).max(50),
});

const submitAnswerItemSchema = z.object({
  questionId: objectIdSchema,
  userAnswer: z.union([z.string(), z.number(), z.boolean()]).nullable(),
  timeTakenSeconds: z.coerce.number().min(0).optional(),
});

const submitMockTestSchema = z.object({
  answers: z.array(submitAnswerItemSchema).min(1, 'At least one answer is required'),
});

const attemptIdParamSchema = z.object({
  attemptId: objectIdSchema,
});

const readinessScoreQuerySchema = z.object({
  careerPathId: objectIdSchema.optional(),
});

const listAttemptsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

// ---- Admin question bank management ----

const createQuestionSchema = z.object({
  questionText: z.string().trim().min(5).max(2000),
  questionType: z.enum(QUESTION_TYPES),
  options: z.array(z.string().trim()).optional(),
  correctAnswer: z.union([z.string(), z.number(), z.boolean()]),
  explanation: z.string().trim().max(2000).optional(),
  relatedSkillIds: z.array(objectIdSchema).min(1),
  relatedCareerPathIds: z.array(objectIdSchema).optional().default([]),
  difficultyLevel: z.enum(DIFFICULTY_LEVELS),
});

const updateQuestionSchema = createQuestionSchema.partial();

const questionIdParamSchema = z.object({
  id: objectIdSchema,
});

module.exports = {
  getPracticeQuestionsQuerySchema,
  startMockTestSchema,
  submitMockTestSchema,
  attemptIdParamSchema,
  readinessScoreQuerySchema,
  listAttemptsQuerySchema,
  createQuestionSchema,
  updateQuestionSchema,
  questionIdParamSchema,
};