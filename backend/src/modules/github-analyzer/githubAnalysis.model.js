/**
 * githubAnalysis.model.js
 * -----------------------------------------
 * Persisted history of GitHub profile analyses, following the same
 * pattern established by resumeAnalysis.model.js in Phase 12.
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;

const languageDistributionSchema = new Schema(
  {
    language: { type: String, required: true },
    bytes: { type: Number, required: true },
    percentage: { type: Number, required: true },
  },
  { _id: false }
);

const inferredSkillSchema = new Schema(
  {
    skillId: { type: Schema.Types.ObjectId, ref: 'SkillTaxonomy', required: true },
    skillName: { type: String, required: true },
  },
  { _id: false }
);

const qualitySignalSchema = new Schema(
  {
    label: { type: String, required: true },
    passed: { type: Boolean, required: true },
    note: { type: String, required: true },
  },
  { _id: false }
);

const githubAnalysisSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    githubUsername: {
      type: String,
      required: true,
      trim: true,
    },
    profileSnapshot: {
      publicRepoCount: { type: Number, default: 0 },
      followerCount: { type: Number, default: 0 },
      avatarUrl: { type: String },
      profileUrl: { type: String },
    },
    languageDistribution: {
      type: [languageDistributionSchema],
      default: [],
    },
    inferredSkills: {
      type: [inferredSkillSchema],
      default: [],
    },
    repoQualitySignals: {
      hasReadmes: { type: Boolean, default: false },
      readmeCoveragePercentage: { type: Number, default: 0 },
      hasRecentActivity: { type: Boolean, default: false },
      commitFrequencySignal: {
        type: String,
        enum: ['active', 'occasional', 'inactive', 'insufficientData'],
        default: 'insufficientData',
      },
      originalRepoCount: { type: Number, default: 0 },
      totalStars: { type: Number, default: 0 },
      qualitySignals: { type: [qualitySignalSchema], default: [] },
    },
    aiSummary: {
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

githubAnalysisSchema.index({ userId: 1, createdAt: -1 });

const GithubAnalysis = mongoose.model('GithubAnalysis', githubAnalysisSchema);

module.exports = GithubAnalysis;