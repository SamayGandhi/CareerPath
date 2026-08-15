/**
 * review.controller.js
 * -----------------------------------------
 * HTTP layer for the Reviews module.
 * UPDATED (Phase 18): moderateDelete() passes actor context for
 * audit logging.
 */

const asyncHandler = require('../../shared/helpers/asyncHandler');
const ApiResponse = require('../../shared/responses/ApiResponse');
const reviewService = require('./review.service');

const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(req.user.id, req.body);
  return ApiResponse.created(res, 'Review submitted successfully', { review });
});

const listReviews = asyncHandler(async (req, res) => {
  const { items, pagination } = await reviewService.listByTarget(req.query);
  return ApiResponse.ok(res, 'Reviews fetched successfully', { reviews: items }, pagination);
});

const updateMyReview = asyncHandler(async (req, res) => {
  const review = await reviewService.updateMyReview(req.params.id, req.user.id, req.body);
  return ApiResponse.ok(res, 'Review updated successfully', { review });
});

const deleteMyReview = asyncHandler(async (req, res) => {
  await reviewService.deleteMyReview(req.params.id, req.user.id);
  return ApiResponse.ok(res, 'Review deleted successfully', null);
});

const moderateDelete = asyncHandler(async (req, res) => {
  await reviewService.moderateDelete(req.params.id, {
    actorUserId: req.user.id,
    ipAddress: req.ip,
  });
  return ApiResponse.ok(res, 'Review removed by moderator', null);
});

module.exports = {
  createReview,
  listReviews,
  updateMyReview,
  deleteMyReview,
  moderateDelete,
};