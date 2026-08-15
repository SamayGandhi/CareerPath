/**
 * notification.model.js
 * -----------------------------------------
 * Roadmap nudges, reassessment reminders, achievement alerts.
 * UPDATED (Batch 5.4): NOTIFICATION_TYPES and RELATED_ENTITY_TYPES
 * extended with 4 new, additive enum values (assessmentCompleted,
 * recommendationReady, resumeAnalyzed, interviewCompleted) and 3 new
 * related-entity types. This is purely additive — all previously
 * existing enum values remain valid, no existing document is affected,
 * and every field type/index is unchanged.
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;

const NOTIFICATION_TYPES = [
  'roadmapReminder',
  'newCourseMatch',
  'reassessmentDue',
  'stageCompleted',
  'assessmentCompleted',
  'recommendationReady',
  'resumeAnalyzed',
  'interviewCompleted',
  'system',
];

const RELATED_ENTITY_TYPES = [
  'roadmap',
  'course',
  'recommendation',
  'assessment',
  'resumeAnalysis',
  'interviewAttempt',
];

const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: 150,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: 500,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedEntityType: {
      type: String,
      enum: RELATED_ENTITY_TYPES,
    },
    relatedEntityId: {
      type: Schema.Types.ObjectId,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;