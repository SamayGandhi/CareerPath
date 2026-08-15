/**
 * profile.model.js
 * -----------------------------------------
 * Core "who is this learner" domain object — the single most important
 * read/write target feeding the Skill Gap, Recommendation, and Roadmap
 * engines. `currentSkills` is embedded per the approved database design.
 *
 * UPDATED (Phase 5): added `skillsVersion`, incremented every time
 * currentSkills changes (via assessment merge or manual update). This
 * lets the Skill Gap Engine stamp each generated report with the exact
 * profile state it was computed against (profileSnapshotVersion),
 * enabling future staleness checks.
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;

const EDUCATION_LEVELS = ['school', 'undergraduate', 'postgraduate', 'graduated', 'none'];
const LEARNING_STYLES = ['video', 'text', 'project-based', 'mixed'];
const BUDGET_PREFERENCES = ['free', 'low', 'medium', 'premium', 'noConstraint'];

const currentSkillSchema = new Schema(
  {
    skillId: {
      type: Schema.Types.ObjectId,
      ref: 'SkillTaxonomy',
      required: true,
    },
    proficiency: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const locationSchema = new Schema(
  {
    country: { type: String, trim: true },
    state: { type: String, trim: true },
    city: { type: String, trim: true },
  },
  { _id: false }
);

const profileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    educationLevel: {
      type: String,
      enum: EDUCATION_LEVELS,
      required: [true, 'Education level is required'],
    },
    currentRole: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    yearsOfExperience: {
      type: Number,
      min: 0,
      max: 60,
      default: 0,
    },
    targetCareerPathId: {
      type: Schema.Types.ObjectId,
      ref: 'CareerPath',
    },
    currentSkills: {
      type: [currentSkillSchema],
      default: [],
    },
    skillsVersion: {
      type: Number,
      default: 0,
    },
    interests: {
      type: [String],
      default: [],
    },
    preferredLearningStyle: {
      type: String,
      enum: LEARNING_STYLES,
    },
    weeklyTimeCommitmentHours: {
      type: Number,
      min: 1,
      max: 80,
    },
    budgetPreference: {
      type: String,
      enum: BUDGET_PREFERENCES,
    },
    preferredLanguage: {
      type: String,
      default: 'en',
    },
    location: {
      type: locationSchema,
      default: {},
    },
    resumeUploaded: {
      type: Boolean,
      default: false,
    },
    resumeUrl: {
      type: String,
    },
    profileCompletionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastAssessmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Assessment',
    },
  },
  {
    timestamps: true,
  }
);

profileSchema.index({ userId: 1 }, { unique: true });
profileSchema.index({ targetCareerPathId: 1 });
profileSchema.index({ 'currentSkills.skillId': 1 });

profileSchema.methods.computeCompletionPercentage = function () {
  const weightedFields = [
    { present: !!this.educationLevel, weight: 15 },
    { present: this.yearsOfExperience !== undefined && this.yearsOfExperience !== null, weight: 5 },
    { present: !!this.targetCareerPathId, weight: 20 },
    { present: this.currentSkills && this.currentSkills.length > 0, weight: 25 },
    { present: this.interests && this.interests.length > 0, weight: 10 },
    { present: !!this.preferredLearningStyle, weight: 5 },
    { present: !!this.weeklyTimeCommitmentHours, weight: 10 },
    { present: !!this.budgetPreference, weight: 5 },
    { present: !!this.resumeUploaded, weight: 5 },
  ];

  const total = weightedFields.reduce((sum, f) => sum + (f.present ? f.weight : 0), 0);
  return Math.min(100, total);
};

profileSchema.pre('save', function (next) {
  this.profileCompletionPercentage = this.computeCompletionPercentage();
  next();
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;