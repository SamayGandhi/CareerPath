/**
 * interviewAttempt.model.js
 * -----------------------------------------
 * User's mock test session records, per the approved database design.
 * `questionsAttempted` is embedded — an immutable, point-in-time
 * snapshot of what was asked and how the user answered.
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;

const ATTEMPT_STATUSES = ['inProgress', 'submitted'];

const questionAttemptSchema = new Schema(
  {
    questionId: { type: Schema.Types.ObjectId, ref: 'InterviewQuestion', required: true },
    userAnswer: { type: Schema.Types.Mixed, default: null },
    isCorrect: { type: Boolean, default: null },
    timeTakenSeconds: { type: Number, default: null },
  },
  { _id: false }
);

const interviewAttemptSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    careerPathId: {
      type: Schema.Types.ObjectId,
      ref: 'CareerPath',
    },
    questionsAttempted: {
      type: [questionAttemptSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'A mock test attempt must contain at least one question',
      },
    },
    status: {
      type: String,
      enum: ATTEMPT_STATUSES,
      default: 'inProgress',
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    correctCount: {
      type: Number,
      default: 0,
    },
    readinessScoreImpact: {
      type: Number,
      default: 0,
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

interviewAttemptSchema.index({ userId: 1, createdAt: -1 });
interviewAttemptSchema.index({ userId: 1, careerPathId: 1 });

const InterviewAttempt = mongoose.model('InterviewAttempt', interviewAttemptSchema);

module.exports = InterviewAttempt;