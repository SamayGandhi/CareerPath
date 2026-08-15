/**
 * assessment.routes.js
 * -----------------------------------------
 * Routes per approved API contract Module 4 (4.1-4.4). Endpoint 4.5
 * (manual skill proficiency update) was implemented in Phase 2 under
 * /profiles/me/skills, since it mutates the profile directly rather
 * than creating an assessment record.
 */

const express = require('express');
const assessmentController = require('./assessment.controller');
const validate = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const {
  getQuestionsQuerySchema,
  submitAssessmentSchema,
  listAssessmentsQuerySchema,
  assessmentIdParamSchema,
} = require('./assessment.validation');

const router = express.Router();

router.use(authenticate);

router.get('/questions', validate(getQuestionsQuerySchema, 'query'), assessmentController.getQuestions);
router.post('/', validate(submitAssessmentSchema), assessmentController.submitAssessment);
router.get('/me', validate(listAssessmentsQuerySchema, 'query'), assessmentController.getHistory);
router.get(
  '/:assessmentId',
  validate(assessmentIdParamSchema, 'params'),
  assessmentController.getById
);

module.exports = router;