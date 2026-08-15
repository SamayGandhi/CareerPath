/**
 * careerPath.model.js
 * -----------------------------------------
 * Defines target career destinations with their required skill sets —
 * consumed by the Skill Gap Engine (comparison target) and Roadmap
 * Engine (template selection) in later phases. `requiredSkills` is
 * embedded per the approved database design: bounded, always read as
 * a whole set together with the path.
 */

const mongoose = require('mongoose');
const { USER_TYPES } = require('../../config/constants');

const { Schema } = mongoose;

const GROWTH_OUTLOOKS = ['high', 'medium', 'low'];

const requiredSkillSchema = new Schema(
  {
    skillId: {
      type: Schema.Types.ObjectId,
      ref: 'SkillTaxonomy',
      required: true,
    },
    minProficiency: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
  },
  { _id: false }
);

const salaryRangeSchema = new Schema(
  {
    min: { type: Number, min: 0 },
    max: { type: Number, min: 0 },
    currency: { type: String, default: 'USD' },
  },
  { _id: false }
);

const careerPathSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Career path title is required'],
      trim: true,
      unique: true,
      maxlength: 150,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 2000,
    },
    industry: {
      type: String,
      trim: true,
    },
    requiredSkills: {
      type: [requiredSkillSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'A career path must have at least one required skill',
      },
    },
    averageSalaryRange: {
      type: salaryRangeSchema,
      default: {},
    },
    growthOutlook: {
      type: String,
      enum: GROWTH_OUTLOOKS,
    },
    roadmapTemplateRef: {
      type: String,
      trim: true,
    },
    suitableForUserTypes: {
      type: [{ type: String, enum: Object.values(USER_TYPES) }],
      default: [],
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

careerPathSchema.index({ slug: 1 }, { unique: true });
careerPathSchema.index({ industry: 1 });
careerPathSchema.index({ suitableForUserTypes: 1 });
careerPathSchema.index({ title: 'text', description: 'text' });

const CareerPath = mongoose.model('CareerPath', careerPathSchema);

module.exports = CareerPath;