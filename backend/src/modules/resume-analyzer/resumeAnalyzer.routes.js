/**
 * resumeAnalyzer.routes.js
 * -----------------------------------------
 * Routes per approved API contract Module 13. Rate-limited to 5/hour
 * per the contract's table for AI-adjacent/expensive endpoints (this
 * one involves file parsing, which is comparatively expensive even
 * without any AI call).
 */

const express = require('express');
const resumeAnalyzerController = require('./resumeAnalyzer.controller');
const validate = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { createRateLimiter } = require('../../middlewares/rateLimiter.middleware');
const { handleResumeAnalysisUpload } = require('../../middlewares/upload.middleware');
const {
  analyzeResumeBodySchema,
  listHistoryQuerySchema,
  analysisIdParamSchema,
} = require('./resumeAnalyzer.validation');

const router = express.Router();

router.use(authenticate);

const analyzeRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many resume analysis requests. Please try again in an hour.',
});

router.post(
  '/analyze',
  analyzeRateLimiter,
  handleResumeAnalysisUpload,
  validate(analyzeResumeBodySchema),
  resumeAnalyzerController.analyze
);
router.get(
  '/me/history',
  validate(listHistoryQuerySchema, 'query'),
  resumeAnalyzerController.getHistory
);
router.get(
  '/:analysisId',
  validate(analysisIdParamSchema, 'params'),
  resumeAnalyzerController.getById
);

module.exports = router;