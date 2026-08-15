/**
 * review.routes.js
 * -----------------------------------------
 * Routes per approved API contract Module 18.
 */

const express = require('express');
const reviewController = require('./review.controller');
const validate = require('../../middlewares/validate.middleware');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { USER_ROLES } = require('../../config/constants');
const {
  createReviewSchema,
  updateReviewSchema,
  listReviewsQuerySchema,
  reviewIdParamSchema,
} = require('./review.validation');

const router = express.Router();

// ---- Public ----
router.get('/', validate(listReviewsQuerySchema, 'query'), reviewController.listReviews);

// ---- Authenticated ----
router.post('/', authenticate, validate(createReviewSchema), reviewController.createReview);
router.patch(
  '/:id',
  authenticate,
  validate(reviewIdParamSchema, 'params'),
  validate(updateReviewSchema),
  reviewController.updateMyReview
);
router.delete(
  '/:id',
  authenticate,
  validate(reviewIdParamSchema, 'params'),
  reviewController.deleteMyReview
);

// ---- Admin Moderation ----
router.delete(
  '/:id/moderate',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  validate(reviewIdParamSchema, 'params'),
  reviewController.moderateDelete
);

module.exports = router;