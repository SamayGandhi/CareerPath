/**
 * assessmentQuestion.model.js
 * -----------------------------------------
 * Admin-managed question bank for skill self-assessments. Each question
 * maps to exactly one skill in the taxonomy and carries the information
 * needed to derive a 1-5 proficiency rating from the user's answer,
 * which is the core input the Skill Gap Engine (Phase 5) will compare
 * against each career path's requiredSkills.
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;

const QUESTION_TYPES = ['proficiencySelect', 'proficiencySlider', 'yesNo'];

/**
 * For 'proficiencySelect' questions: each option carries the proficiency
 * value (1-5) it represents, e.g. "I can build a small project alone" -> 4.
 */
const optionSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    proficiencyValue: { type: Number, required: true, min: 1, max: 5 },
  },
  { _id: false }
);

const assessmentQuestionSchema = new Schema(
  {
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
      maxlength: 500,
    },
    questionType: {
      type: String,
      enum: QUESTION_TYPES,
      required: true,
    },
    skillId: {
      type: Schema.Types.ObjectId,
      ref: 'SkillTaxonomy',
      required: [true, 'Question must be linked to a skill'],
    },
    // Used only for 'proficiencySelect' type
    options: {
      type: [optionSchema],
      default: undefined,
      validate: {
        validator: function (options) {
          if (this.questionType !== 'proficiencySelect') return true;
          return Array.isArray(options) && options.length >= 2;
        },
        message: 'proficiencySelect questions require at least 2 options',
      },
    },
    assessmentType: {
      type: String,
      enum: ['initialOnboarding', 'periodicReassessment', 'skillSpecificQuiz'],
      required: true,
      default: 'initialOnboarding',
    },
    order: {
      type: Number,
      default: 0,
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

assessmentQuestionSchema.index({ assessmentType: 1, isActive: 1, order: 1 });
assessmentQuestionSchema.index({ skillId: 1 });

const AssessmentQuestion = mongoose.model('AssessmentQuestion', assessmentQuestionSchema);

module.exports = AssessmentQuestion;