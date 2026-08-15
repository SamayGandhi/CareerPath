/**
 * portfolioAnalysis.model.js
 * -----------------------------------------
 * Persisted history of portfolio analyses, following the same pattern
 * established by resumeAnalysis.model.js and githubAnalysis.model.js.
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;

const breakdownItemSchema = new Schema(
  {
    label: { type: String, required: true },
    points: { type: Number, required: true },
    maxPoints: { type: Number, required: true },
    note: { type: String, required: true },
  },
  { _id: false }
);

const portfolioAnalysisSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    portfolioUrl: {
      type: String,
      required: true,
      trim: true,
    },
    detectedSections: {
      about: { type: Boolean, default: false },
      projects: { type: Boolean, default: false },
      skills: { type: Boolean, default: false },
      experience: { type: Boolean, default: false },
      contact: { type: Boolean, default: false },
    },
    projectCount: {
      type: Number,
      default: 0,
    },
    techStackDetected: {
      type: [String],
      default: [],
    },
    completenessScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    completenessBreakdown: {
      type: [breakdownItemSchema],
      default: [],
    },
    aiFeedback: {
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

portfolioAnalysisSchema.index({ userId: 1, createdAt: -1 });

const PortfolioAnalysis = mongoose.model('PortfolioAnalysis', portfolioAnalysisSchema);

module.exports = PortfolioAnalysis;