/**
 * progress.model.js
 * -----------------------------------------
 * Fine-grained, high-write-frequency tracking of what the user has
 * actually completed — deliberately a SEPARATE collection from
 * `roadmaps` per the approved database design. Progress updates happen
 * far more often (every course click, every percentage tick) than
 * roadmap structure changes; keeping them separate avoids document
 * growth/rewrite churn on the roadmap document (MongoDB best practice:
 * separate high-write-frequency data from low-write-frequency
 * structural data, even when logically related).
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;

const ACTIVITY_TYPES = ['courseEnrollment', 'courseCompletion', 'projectSubmission', 'skillSelfCheck'];
const PROGRESS_STATUSES = ['notStarted', 'inProgress', 'completed'];

const progressSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roadmapId: {
      type: Schema.Types.ObjectId,
      ref: 'Roadmap',
      required: true,
    },
    stageId: {
      type: String,
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
    },
    activityType: {
      type: String,
      enum: ACTIVITY_TYPES,
      required: true,
    },
    status: {
      type: String,
      enum: PROGRESS_STATUSES,
      default: 'notStarted',
    },
    completionPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

progressSchema.index({ userId: 1, roadmapId: 1, stageId: 1 });
progressSchema.index({ userId: 1, courseId: 1 });

/**
 * Auto-derives status/timestamps from completionPercentage changes,
 * so callers can set just a percentage and get consistent status
 * transitions rather than every caller re-implementing this logic.
 */
progressSchema.pre('save', function (next) {
  if (this.isModified('completionPercentage')) {
    if (this.completionPercentage >= 100) {
      this.completionPercentage = 100;
      this.status = 'completed';
      if (!this.completedAt) this.completedAt = new Date();
    } else if (this.completionPercentage > 0) {
      this.status = 'inProgress';
      if (!this.startedAt) this.startedAt = new Date();
    }
  }

  if (this.isModified('status')) {
    if (this.status === 'inProgress' && !this.startedAt) {
      this.startedAt = new Date();
    }
    if (this.status === 'completed') {
      this.completionPercentage = 100;
      if (!this.completedAt) this.completedAt = new Date();
    }
  }

  next();
});

const Progress = mongoose.model('Progress', progressSchema);

module.exports = Progress;