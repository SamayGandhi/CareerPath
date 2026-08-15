/**
 * platform.model.js
 * -----------------------------------------
 * Powers the "Compare Learning Platforms" feature. Kept as a separate
 * collection from `courses` (referenced, not embedded) per the approved
 * database design — a platform is referenced by potentially thousands
 * of courses, so embedding would massively duplicate data and create
 * update anomalies if a platform's rating/pricing model changes.
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;

const PRICING_MODELS = ['subscription', 'payPerCourse', 'freemium', 'free'];
const CERTIFICATION_RECOGNITION_LEVELS = ['high', 'medium', 'low'];

const platformSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Platform name is required'],
      trim: true,
      unique: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    logoUrl: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    pricingModel: {
      type: String,
      enum: PRICING_MODELS,
      required: [true, 'Pricing model is required'],
    },
    certificationRecognition: {
      type: String,
      enum: CERTIFICATION_RECOGNITION_LEVELS,
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    supportedLanguages: {
      type: [String],
      default: ['en'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

platformSchema.index({ slug: 1 }, { unique: true });

const Platform = mongoose.model('Platform', platformSchema);

module.exports = Platform;