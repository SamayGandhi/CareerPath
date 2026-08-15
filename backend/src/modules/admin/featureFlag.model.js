/**
 * featureFlag.model.js
 * -----------------------------------------
 * Runtime-toggleable feature flags, persisted so changes survive
 * server restarts and apply across all instances in a multi-instance
 * deployment. The most important flag is `AI_FEATURE_ENABLED` — the
 * kill switch that operationalizes the platform's core requirement
 * that AI can be disabled at any time without redeploying, and every
 * core engine keeps working regardless.
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;

const featureFlagSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    enabled: {
      type: Boolean,
      required: true,
      default: false,
    },
    description: {
      type: String,
      trim: true,
    },
    lastModifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

featureFlagSchema.index({ key: 1 }, { unique: true });

const FeatureFlag = mongoose.model('FeatureFlag', featureFlagSchema);

module.exports = FeatureFlag;