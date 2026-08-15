/**
 * recommendation.model.js
 * -----------------------------------------
 * Persisted output of the Recommendation Engine, per the approved
 * database design. `recommendedCourses` embeds a frozen, point-in-time
 * snapshot (score/reasons) rather than just referencing courseId —
 * a recommendation is a historical decision record: if a course's price
 * changes next week, this record should still show why it was
 * recommended AT THE TIME.
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;

const ruleBreakdownSchema = new Schema(
  {
    ruleName: { type: String, required: true },
    contribution: { type: Number, required: true },
  },
  { _id: false }
);

const recommendedCourseSchema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    reasons: { type: [String], default: [] },
    ruleBreakdown: { type: [ruleBreakdownSchema], default: [] },
  },
  { _id: false }
);

const recommendedPlatformSchema = new Schema(
  {
    platformId: { type: Schema.Types.ObjectId, ref: 'Platform', required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    reasons: { type: [String], default: [] },
  },
  { _id: false }
);

const recommendationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    skillGapReportId: {
      type: Schema.Types.ObjectId,
      ref: 'SkillGapReport',
      required: true,
    },
    strategyUsed: {
      type: String,
      required: true,
    },
    recommendedCourses: {
      type: [recommendedCourseSchema],
      required: true,
    },
    recommendedPlatforms: {
      type: [recommendedPlatformSchema],
      default: [],
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
    generatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

recommendationSchema.index({ userId: 1, createdAt: -1 });
recommendationSchema.index({ skillGapReportId: 1 });

const Recommendation = mongoose.model('Recommendation', recommendationSchema);

module.exports = Recommendation;