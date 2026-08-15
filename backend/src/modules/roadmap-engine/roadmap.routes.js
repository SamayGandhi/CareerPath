/**
 * roadmap.routes.js
 * -----------------------------------------
 * Routes per approved API contract Module 8. Static path '/me/active'
 * and '/me' registered before the generic '/:id' route.
 */

const express = require('express');
const roadmapController = require('./roadmap.controller');
const validate = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const {
  generateRoadmapSchema,
  listRoadmapsQuerySchema,
  roadmapIdParamSchema,
  stageParamSchema,
  updateStageStatusSchema,
} = require('./roadmap.validation');

const router = express.Router();

router.use(authenticate);

router.post('/generate', validate(generateRoadmapSchema), roadmapController.generate);
router.get('/me/active', roadmapController.getActive);
router.get('/me', validate(listRoadmapsQuerySchema, 'query'), roadmapController.getAllForUser);
router.get('/:id', validate(roadmapIdParamSchema, 'params'), roadmapController.getById);
router.patch(
  '/:id/stages/:stageId',
  validate(stageParamSchema, 'params'),
  validate(updateStageStatusSchema),
  roadmapController.updateStageStatus
);
router.post(
  '/:id/regenerate',
  validate(roadmapIdParamSchema, 'params'),
  roadmapController.regenerate
);
router.patch(
  '/:id/abandon',
  validate(roadmapIdParamSchema, 'params'),
  roadmapController.abandon
);

module.exports = router;