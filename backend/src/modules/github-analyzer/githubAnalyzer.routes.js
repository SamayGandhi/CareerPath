/**
 * githubAnalyzer.routes.js
 * -----------------------------------------
 * Routes per approved API contract Module 14. Rate-limited to 5/hour
 * per the contract's table.
 */

const express = require('express');
const githubAnalyzerController = require('./githubAnalyzer.controller');
const validate = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { createRateLimiter } = require('../../middlewares/rateLimiter.middleware');
const {
  analyzeGithubSchema,
  listHistoryQuerySchema,
  analysisIdParamSchema,
} = require('./githubAnalyzer.validation');

const router = express.Router();

router.use(authenticate);

const analyzeRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many GitHub analysis requests. Please try again in an hour.',
});

router.post(
  '/analyze',
  analyzeRateLimiter,
  validate(analyzeGithubSchema),
  githubAnalyzerController.analyze
);
router.get(
  '/me/history',
  validate(listHistoryQuerySchema, 'query'),
  githubAnalyzerController.getHistory
);
router.get(
  '/:analysisId',
  validate(analysisIdParamSchema, 'params'),
  githubAnalyzerController.getById
);

module.exports = router;