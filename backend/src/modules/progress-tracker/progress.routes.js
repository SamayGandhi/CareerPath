/**
 * progress.routes.js
 * -----------------------------------------
 * Routes per approved API contract Module 12.
 */

const express = require('express');
const progressController = require('./progress.controller');
const validate = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const {
  createProgressSchema,
  updateProgressSchema,
  listProgressQuerySchema,
  progressIdParamSchema,
  roadmapIdParamSchema,
} = require('./progress.validation');

const router = express.Router();

router.use(authenticate);

router.get('/me', validate(listProgressQuerySchema, 'query'), progressController.getAllForUser);
router.post('/', validate(createProgressSchema), progressController.create);
router.patch(
  '/:id',
  validate(progressIdParamSchema, 'params'),
  validate(updateProgressSchema),
  progressController.update
);
router.get(
  '/roadmap/:roadmapId/summary',
  validate(roadmapIdParamSchema, 'params'),
  progressController.getRoadmapSummary
);

module.exports = router;