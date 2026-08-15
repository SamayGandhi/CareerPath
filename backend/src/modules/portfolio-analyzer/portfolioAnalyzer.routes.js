/**
 * portfolioAnalyzer.routes.js
 * -----------------------------------------
 * Routes per approved API contract Module 15. Rate-limited to 5/hour
 * per the contract's table.
 */

const express = require('express');
const portfolioAnalyzerController = require('./portfolioAnalyzer.controller');
const validate = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { createRateLimiter } = require('../../middlewares/rateLimiter.middleware');
const {
  analyzePortfolioSchema,
  listHistoryQuerySchema,
  analysisIdParamSchema,
} = require('./portfolioAnalyzer.validation');

const router = express.Router();

router.use(authenticate);

const analyzeRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many portfolio analysis requests. Please try again in an hour.',
});

router.post(
  '/analyze',
  analyzeRateLimiter,
  validate(analyzePortfolioSchema),
  portfolioAnalyzerController.analyze
);
router.get(
  '/me/history',
  validate(listHistoryQuerySchema, 'query'),
  portfolioAnalyzerController.getHistory
);
router.get(
  '/:analysisId',
  validate(analysisIdParamSchema, 'params'),
  portfolioAnalyzerController.getById
);

module.exports = router;