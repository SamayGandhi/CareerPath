/**
 * review.service.js
 * -----------------------------------------
 * Business logic for Reviews.
 * UPDATED (Phase 18): moderateDelete() now accepts actor context and
 * records an audit log entry — moderation removal of user content is a
 * sensitive, traceable admin action.
 */

const ApiError = require('../../shared/errors/ApiError');
const reviewRepository = require('./review.repository');
const courseRepository = require('../course/course.repository');
const platformRepository = require('../platform/platform.repository');
const progressRepository = require('../progress-tracker/progress.repository');
const { recordAuditLog } = require('../../shared/helpers/auditLogger.helper');
const { PAGINATION_DEFAULTS } = require('../../config/constants');

class ReviewService {
  async createReview(userId, { targetType, targetId, rating, comment }) {
    await this._assertTargetExists(targetType, targetId);

    const existing = await reviewRepository.findExistingByUserAndTarget(userId, targetType, targetId);
    if (existing) {
      throw ApiError.conflict(
        'You have already reviewed this item. You can update your existing review instead.',
        'REVIEW_ALREADY_EXISTS'
      );
    }

    const isVerifiedCompletion =
      targetType === 'course'
        ? Boolean(await progressRepository.findOneByUserAndCourse(userId, targetId))
        : false;

    const review = await reviewRepository.create({
      userId,
      targetType,
      targetId,
      rating,
      comment,
      isVerifiedCompletion,
    });

    await this._syncAggregateRating(targetType, targetId);

    return reviewRepository.findById(review._id);
  }

  async listByTarget(query) {
    const { targetType, targetId, page, limit, sortBy } = query;

    await this._assertTargetExists(targetType, targetId);

    const { items, totalItems } = await reviewRepository.findByTarget(targetType, targetId, {
      page: page || PAGINATION_DEFAULTS.DEFAULT_PAGE,
      limit: limit || PAGINATION_DEFAULTS.DEFAULT_LIMIT,
      sortBy,
    });

    return { items, pagination: this._buildPagination(page, limit, totalItems) };
  }

  async updateMyReview(reviewId, userId, updateData) {
    const review = await reviewRepository.findRawById(reviewId);
    if (!review) {
      throw ApiError.notFound('Review not found', 'REVIEW_NOT_FOUND');
    }
    if (review.userId.toString() !== userId) {
      throw ApiError.forbidden('You can only edit your own reviews', 'FORBIDDEN');
    }

    const updated = await reviewRepository.updateById(reviewId, updateData);
    await this._syncAggregateRating(updated.targetType, updated.targetId);

    return reviewRepository.findById(updated._id);
  }

  async deleteMyReview(reviewId, userId) {
    const review = await reviewRepository.findRawById(reviewId);
    if (!review) {
      throw ApiError.notFound('Review not found', 'REVIEW_NOT_FOUND');
    }
    if (review.userId.toString() !== userId) {
      throw ApiError.forbidden('You can only delete your own reviews', 'FORBIDDEN');
    }

    await reviewRepository.deleteById(reviewId);
    await this._syncAggregateRating(review.targetType, review.targetId);
  }

  /**
   * Admin moderation delete — bypasses ownership check, now records
   * an audit log entry via the shared helper.
   */
  async moderateDelete(reviewId, actorContext) {
    const review = await reviewRepository.findRawById(reviewId);
    if (!review) {
      throw ApiError.notFound('Review not found', 'REVIEW_NOT_FOUND');
    }

    await reviewRepository.deleteById(reviewId);
    await this._syncAggregateRating(review.targetType, review.targetId);

    if (actorContext) {
      await recordAuditLog({
        actorUserId: actorContext.actorUserId,
        action: 'REVIEW_MODERATED_DELETE',
        targetEntityType: 'Review',
        targetEntityId: review._id,
        metadata: {
          reviewOwnerId: review.userId,
          targetType: review.targetType,
          targetId: review.targetId,
        },
        ipAddress: actorContext.ipAddress,
      });
    }
  }

  async _assertTargetExists(targetType, targetId) {
    if (targetType === 'course') {
      const course = await courseRepository.findById(targetId);
      if (!course || !course.isActive) {
        throw ApiError.notFound('Course not found', 'COURSE_NOT_FOUND');
      }
    } else if (targetType === 'platform') {
      const platform = await platformRepository.findById(targetId);
      if (!platform || !platform.isActive) {
        throw ApiError.notFound('Platform not found', 'PLATFORM_NOT_FOUND');
      }
    }
  }

  async _syncAggregateRating(targetType, targetId) {
    const { averageRating, count } = await reviewRepository.getAggregateRating(targetType, targetId);

    if (targetType === 'course') {
      await courseRepository.syncRating(targetId, { averageRating, count });
    } else if (targetType === 'platform') {
      await platformRepository.updateById(targetId, {
        averageRating: Math.round(averageRating * 10) / 10,
      });
    }
  }

  _buildPagination(page, limit, totalItems) {
    return { page, limit, totalPages: Math.ceil(totalItems / limit), totalItems };
  }
}

module.exports = new ReviewService();