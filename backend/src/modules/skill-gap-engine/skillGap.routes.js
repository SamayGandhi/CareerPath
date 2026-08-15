/**
 * skillGap.routes.js
 * -----------------------------------------
 * Routes per approved API contract Module 6. A dedicated, stricter
 * rate limit (10/hour) is applied to /analyze per the contract's
 * rate-limiting table — this is a compute-touching endpoint, and the
 * limit also discourages spammy re-analysis before a profile has
 * meaningfully changed.
 */

const express = require('express');
const skillGapController = require('./skillGap.controller');
const validate = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { createRateLimiter } = require('../../middlewares/rateLimiter.middleware');
const {
  analyzeSkillGapSchema,
  getLatestQuerySchema,
  getHistoryQuerySchema,
  reportIdParamSchema,
} = require('./skillGap.validation');

const router = express.Router();

router.use(authenticate);

const analyzeRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many skill gap analysis requests. Please try again in an hour.',
});

router.post(
  '/analyze',
  analyzeRateLimiter,
  validate(analyzeSkillGapSchema),
  skillGapController.analyze
);
router.get('/me/latest', validate(getLatestQuerySchema, 'query'), skillGapController.getLatest);
router.get('/me/history', validate(getHistoryQuerySchema, 'query'), skillGapController.getHistory);
router.get(
  '/:reportId',
  validate(reportIdParamSchema, 'params'),
  skillGapController.getById
);

module.exports = router;