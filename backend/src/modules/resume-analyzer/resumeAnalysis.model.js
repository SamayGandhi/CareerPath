/**
 * resumeAnalysis.model.js
 * -----------------------------------------
 * Persisted history of resume analyses. Not explicitly named in the
 * originally approved core collection list, but follows the exact same
 * pattern established for skillGapReports/recommendations (persisted,
 * auditable, historical rule-engine output) — a necessary and
 * consistent extension for the Resume Analyzer feature's history
 * endpoint (API contract 13.2).
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;

const matchedSkillSchema = new Schema(
  {
    skillId: { type: Schema.Types.ObjectId, ref: 'SkillTaxonomy', required: true },
    skillName: { type: String, required: true },
    category: { type: String },
    matchCount: { type: Number, required: true },
  },
  { _id: false }
);

const atsBreakdownItemSchema = new Schema(
  {
    label: { type: String, required: true },
    points: { type: Number, required: true },
    maxPoints: { type: Number, required: true },
    note: { type: String, required: true },
  },
  { _id: false }
);

const resumeAnalysisSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    storedFilePath: {
      type: String,
      required: true,
    },
    extractedSkills: {
      type: [matchedSkillSchema],
      default: [],
    },
    missingSkillsForTarget: {
      type: [{ type: Schema.Types.ObjectId, ref: 'SkillTaxonomy' }],
      default: [],
    },
    targetCareerPathId: {
      type: Schema.Types.ObjectId,
      ref: 'CareerPath',
    },
    atsScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    atsBreakdown: {
      type: [atsBreakdownItemSchema],
      default: [],
    },
    aiSuggestions: {
      type: String,
      default: null,
    },
    aiEnhancementStatus: {
      type: String,
      enum: ['notAttempted', 'success', 'failedFallbackUsed'],
      default: 'notAttempted',
    },
  },
  {
    timestamps: true,
  }
);

resumeAnalysisSchema.index({ userId: 1, createdAt: -1 });

const ResumeAnalysis = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);

module.exports = ResumeAnalysis;