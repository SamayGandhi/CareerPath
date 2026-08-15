/**
 * interviewPrep.routes.js
 * -----------------------------------------
 * Routes per approved API contract Module 16.
 */

const express = require('express');
const interviewPrepController = require('./interviewPrep.controller');
const validate = require('../../middlewares/validate.middleware');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { USER_ROLES } = require('../../config/constants');
const {
  getPracticeQuestionsQuerySchema,
  startMockTestSchema,
  submitMockTestSchema,
  attemptIdParamSchema,
  readinessScoreQuerySchema,
  listAttemptsQuerySchema,
  createQuestionSchema,
  updateQuestionSchema,
  questionIdParamSchema,
} = require('./interviewPrep.validation');

const router = express.Router();

router.use(authenticate);

router.get(
  '/questions',
  validate(getPracticeQuestionsQuerySchema, 'query'),
  interviewPrepController.getPracticeQuestions
);
router.post(
  '/mock-test/start',
  validate(startMockTestSchema),
  interviewPrepController.startMockTest
);
router.post(
  '/mock-test/:attemptId/submit',
  validate(attemptIdParamSchema, 'params'),
  validate(submitMockTestSchema),
  interviewPrepController.submitMockTest
);
router.get(
  '/attempts/me',
  validate(listAttemptsQuerySchema, 'query'),
  interviewPrepController.getAttemptHistory
);
router.get(
  '/me/readiness-score',
  validate(readinessScoreQuerySchema, 'query'),
  interviewPrepController.getReadinessScore
);

// ---- Admin / Content Manager: Question Bank Management ----
router.post(
  '/questions',
  authorize(USER_ROLES.ADMIN, USER_ROLES.CONTENT_MANAGER),
  validate(createQuestionSchema),
  interviewPrepController.createQuestion
);
router.put(
  '/questions/:id',
  authorize(USER_ROLES.ADMIN, USER_ROLES.CONTENT_MANAGER),
  validate(questionIdParamSchema, 'params'),
  validate(updateQuestionSchema),
  interviewPrepController.updateQuestion
);
router.delete(
  '/questions/:id',
  authorize(USER_ROLES.ADMIN),
  validate(questionIdParamSchema, 'params'),
  interviewPrepController.deactivateQuestion
);

module.exports = router;