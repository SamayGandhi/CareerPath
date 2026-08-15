/**
 * course.model.js
 * -----------------------------------------
 * Core catalog entity — the "product" the Recommendation Engine
 * scores in Phase 7. `skillsCovered` is REFERENCED (array of ObjectIds,
 * not embedded), unlike Profile/CareerPath's embedded skill arrays,
 * because courses are queried FROM the skill side constantly
 * ("which courses cover this missing skill?") — a reverse lookup
 * across potentially thousands of courses. A multikey index supports
 * this efficiently without duplicating skill metadata into every course.
 */

const mongoose = require('mongoose');
const { USER_TYPES } = require('../../config/constants');

const { Schema } = mongoose;

const COURSE_LEVELS = ['beginner', 'intermediate', 'advanced', 'allLevels'];

const priceSchema = new Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    isFree: { type: Boolean, default: false },
  },
  { _id: false }
);

const courseSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: 250,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    platformId: {
      type: Schema.Types.ObjectId,
      ref: 'Platform',
      required: [true, 'Course must belong to a platform'],
    },
    instructor: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 3000,
    },
    skillsCovered: {
      type: [{ type: Schema.Types.ObjectId, ref: 'SkillTaxonomy' }],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'A course must cover at least one skill',
      },
    },
    level: {
      type: String,
      enum: COURSE_LEVELS,
      required: [true, 'Course level is required'],
    },
    durationHours: {
      type: Number,
      min: 0,
    },
    price: {
      type: priceSchema,
      required: true,
    },
    certificationOffered: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    enrollmentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    language: {
      type: String,
      default: 'en',
    },
    externalUrl: {
      type: String,
      required: [true, 'External course URL is required'],
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    suitableForCareerPathIds: {
      type: [{ type: Schema.Types.ObjectId, ref: 'CareerPath' }],
      default: [],
    },
    suitableForUserTypes: {
      type: [{ type: String, enum: Object.values(USER_TYPES) }],
      default: [],
    },
    lastSyncedAt: {
      type: Date,
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

courseSchema.index({ slug: 1 }, { unique: true });
courseSchema.index({ skillsCovered: 1 });
courseSchema.index({ platformId: 1 });
courseSchema.index({ level: 1, isActive: 1 });
courseSchema.index({ suitableForCareerPathIds: 1 });
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;