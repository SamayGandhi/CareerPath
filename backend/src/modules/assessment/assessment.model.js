/**
 * assessment.model.js
 * -----------------------------------------
 * Immutable snapshot of a user's assessment responses at a point in
 * time, per the approved database design. `responses` embeds the
 * question text/answer AS ASKED — even if the master question wording
 * changes later, this document preserves exactly what was presented
 * (audit/consistency reasoning). `derivedSkills` is the computed output
 * that gets merged into profiles.currentSkills.
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;

const ASSESSMENT_TYPES = ['initialOnboarding', 'periodicReassessment', 'skillSpecificQuiz'];

const responseSchema = new Schema(
  {
    questionId: { type: String, required: true },
    questionText: { type: String, required: true },
    answer: { type: Schema.Types.Mixed, required: true },
    skillId: { type: Schema.Types.ObjectId, ref: 'SkillTaxonomy', required: true },
  },
  { _id: false }
);

const derivedSkillSchema = new Schema(
  {
    skillId: { type: Schema.Types.ObjectId, ref: 'SkillTaxonomy', required: true },
    proficiency: { type: Number, required: true, min: 1, max: 5 },
  },
  { _id: false }
);

const assessmentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assessmentType: {
      type: String,
      enum: ASSESSMENT_TYPES,
      required: true,
    },
    responses: {
      type: [responseSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'An assessment must contain at least one response',
      },
    },
    derivedSkills: {
      type: [derivedSkillSchema],
      required: true,
    },
    completedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

assessmentSchema.index({ userId: 1, createdAt: -1 });

const Assessment = mongoose.model('Assessment', assessmentSchema);

module.exports = Assessment;