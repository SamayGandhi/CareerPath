/**
 * skillGapReport.model.js
 * -----------------------------------------
 * Persisted output of the Skill Gap Engine, per the approved database
 * design. UPDATED (AI Enhancement Module): replaced the boolean-only
 * `aiExplanationGenerated` flag with the full `aiEnhancedExplanation`
 * (text) + `aiEnhancementStatus` (enum) pattern already established by
 * the Recommendation model — consistent AI-field shape across every
 * AI-enhanceable resource in the platform.
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;

const GAP_SEVERITIES = ['none', 'minor', 'moderate', 'critical'];

const gapEntrySchema = new Schema(
  {
    skillId: {
      type: Schema.Types.ObjectId,
      ref: 'SkillTaxonomy',
      required: true,
    },
    currentLevel: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    requiredLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    gapSeverity: {
      type: String,
      enum: GAP_SEVERITIES,
      required: true,
    },
    missingPrerequisites: {
      type: [{ type: Schema.Types.ObjectId, ref: 'SkillTaxonomy' }],
      default: [],
    },
  },
  { _id: false }
);

const skillGapReportSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetCareerPathId: {
      type: Schema.Types.ObjectId,
      ref: 'CareerPath',
      required: true,
    },
    profileSnapshotVersion: {
      type: Number,
      required: true,
    },
    gaps: {
      type: [gapEntrySchema],
      required: true,
    },
    overallReadinessScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    generatedBy: {
      type: String,
      enum: ['ruleEngine'],
      default: 'ruleEngine',
      required: true,
    },
    aiEnhancedExplanation: {
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
    timestamps: { createdAt: true, updatedAt: false },
  }
);

skillGapReportSchema.index({ userId: 1, createdAt: -1 });
skillGapReportSchema.index({ userId: 1, targetCareerPathId: 1 });

const SkillGapReport = mongoose.model('SkillGapReport', skillGapReportSchema);

module.exports = SkillGapReport;