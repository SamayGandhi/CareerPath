/**
 * ai.validation.js
 * -----------------------------------------
 * Zod schemas validating the payloads sent TO the AI service. This is
 * defense-in-depth: even though the calling services already produce
 * well-formed data, validating at the gateway boundary means a bug
 * upstream can never send malformed data to an external service, and
 * gives us a single, explicit contract of exactly what leaves this
 * application's boundary.
 */

const { z } = require('zod');

const skillGapItemSchema = z.object({
  skillName: z.string(),
  currentLevel: z.number(),
  requiredLevel: z.number(),
  gapSeverity: z.string(),
});

const skillGapExplanationPayloadSchema = z.object({
  careerPathTitle: z.string(),
  readinessScore: z.number().min(0).max(100),
  gaps: z.array(skillGapItemSchema),
});

const recommendedCourseItemSchema = z.object({
  title: z.string(),
  score: z.number().min(0).max(100),
  reasons: z.array(z.string()).default([]),
});

const recommendationExplanationPayloadSchema = z.object({
  strategyLabel: z.string(),
  courses: z.array(recommendedCourseItemSchema),
});

const atsBreakdownItemSchema = z.object({
  label: z.string(),
  points: z.number(),
  maxPoints: z.number(),
  note: z.string(),
});

const resumeSuggestionsPayloadSchema = z.object({
  extractedSkills: z.array(z.string()).default([]),
  atsBreakdown: z.array(atsBreakdownItemSchema).default([]),
  missingSkills: z.array(z.string()).default([]),
});

const languageItemSchema = z.object({
  language: z.string(),
  percentage: z.number(),
});

const qualitySignalItemSchema = z.object({
  label: z.string(),
  passed: z.boolean(),
  note: z.string(),
});

const githubSummaryPayloadSchema = z.object({
  languages: z.array(languageItemSchema).default([]),
  originalRepoCount: z.number().default(0),
  totalStars: z.number().default(0),
  qualitySignals: z.array(qualitySignalItemSchema).default([]),
});

const detectedSectionsSchema = z.object({
  about: z.boolean().default(false),
  projects: z.boolean().default(false),
  skills: z.boolean().default(false),
  experience: z.boolean().default(false),
  contact: z.boolean().default(false),
});

const portfolioFeedbackPayloadSchema = z.object({
  detectedSections: detectedSectionsSchema,
  projectCount: z.number().default(0),
  techStackDetected: z.array(z.string()).default([]),
});

module.exports = {
  skillGapExplanationPayloadSchema,
  recommendationExplanationPayloadSchema,
  resumeSuggestionsPayloadSchema,
  githubSummaryPayloadSchema,
  portfolioFeedbackPayloadSchema,
};