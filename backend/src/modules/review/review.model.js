/**
 * review.model.js
 * -----------------------------------------
 * Crowd-sourced course/platform reviews, per the approved database
 * design. Uses Mongoose's `refPath` for a polymorphic reference
 * (`targetId` can point to either a Course or a Platform document,
 * decided by `targetType`) — this avoids creating two nearly-identical
 * collections (courseReviews, platformReviews), keeping moderation and
 * rating-aggregation logic in one place.
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;

const TARGET_TYPES = ['course', 'platform'];

// Maps targetType enum values to the actual Mongoose model name refPath
// needs — 'course' -> 'Course', 'platform' -> 'Platform'.
const TARGET_TYPE_TO_MODEL = {
  course: 'Course',
  platform: 'Platform',
};

const reviewSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: {
      type: String,
      enum: TARGET_TYPES,
      required: true,
    },
    targetModel: {
      // Derived automatically from targetType in the pre-validate hook
      // below — refPath needs an actual field holding the model name.
      type: String,
      required: true,
      enum: Object.values(TARGET_TYPE_TO_MODEL),
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'targetModel',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    isVerifiedCompletion: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ targetType: 1, targetId: 1 });
reviewSchema.index({ userId: 1 });
// Prevent duplicate reviews from the same user on the same target
reviewSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });

reviewSchema.pre('validate', function (next) {
  this.targetModel = TARGET_TYPE_TO_MODEL[this.targetType];
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;