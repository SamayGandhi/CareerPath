/**
 * interviewQuestion.model.js
 * -----------------------------------------
 * Master reference data for the Interview-Readiness feature — questions
 * tagged by skill/career path/difficulty, per the approved database
 * design. `correctAnswer` is never selected by default and must never
 * be sent to the client during an active mock test (only after
 * submission, in the results breakdown).
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;

const QUESTION_TYPES = ['mcq', 'descriptive', 'coding', 'behavioral'];
const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];

const interviewQuestionSchema = new Schema(
  {
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
      maxlength: 2000,
    },
    questionType: {
      type: String,
      enum: QUESTION_TYPES,
      required: true,
    },
    options: {
      type: [String],
      default: undefined,
      validate: {
        validator: function (options) {
          if (this.questionType !== 'mcq') return true;
          return Array.isArray(options) && options.length >= 2;
        },
        message: 'mcq questions require at least 2 options',
      },
    },
    correctAnswer: {
      type: Schema.Types.Mixed,
      required: true,
      select: false,
    },
    explanation: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    relatedSkillIds: {
      type: [{ type: Schema.Types.ObjectId, ref: 'SkillTaxonomy' }],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'A question must be linked to at least one skill',
      },
    },
    relatedCareerPathIds: {
      type: [{ type: Schema.Types.ObjectId, ref: 'CareerPath' }],
      default: [],
    },
    difficultyLevel: {
      type: String,
      enum: DIFFICULTY_LEVELS,
      required: true,
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

interviewQuestionSchema.index({ relatedSkillIds: 1 });
interviewQuestionSchema.index({ relatedCareerPathIds: 1, difficultyLevel: 1 });
interviewQuestionSchema.index({ isActive: 1 });

const InterviewQuestion = mongoose.model('InterviewQuestion', interviewQuestionSchema);

module.exports = InterviewQuestion;