/**
 * recommendation.routes.js
 * -----------------------------------------
 * Routes per approved API contract Module 7. /generate carries a
 * stricter rate limit (10/hour) matching the Skill Gap Engine's
 * pattern, since it's a compute-touching endpoint.
 */

const express = require('express');
const recommendationController = require('./recommendation.controller');
const validate = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { createRateLimiter } = require('../../middlewares/rateLimiter.middleware');
const {
  generateRecommendationSchema,
  getHistoryQuerySchema,
  recommendationIdParamSchema,
} = require('./recommendation.validation');

const router = express.Router();

router.use(authenticate);

const generateRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many recommendation requests. Please try again in an hour.',
});

router.post(
  '/generate',
  generateRateLimiter,
  validate(generateRecommendationSchema),
  recommendationController.generate
);
router.get('/me/latest', recommendationController.getLatest);
router.get('/me/history', validate(getHistoryQuerySchema, 'query'), recommendationController.getHistory);
router.get(
  '/:id',
  validate(recommendationIdParamSchema, 'params'),
  recommendationController.getById
);
router.post(
  '/:id/regenerate-explanation',
  validate(recommendationIdParamSchema, 'params'),
  recommendationController.regenerateExplanation
);

module.exports = router;