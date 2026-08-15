/**
 * platform.routes.js
 * -----------------------------------------
 * Routes per approved API contract Module 10. IMPORTANT: the
 * '/compare' route must be registered BEFORE '/:slug' to prevent
 * Express from matching "compare" as a slug parameter.
 */

const express = require('express');
const platformController = require('./platform.controller');
const validate = require('../../middlewares/validate.middleware');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { USER_ROLES } = require('../../config/constants');
const {
  createPlatformSchema,
  updatePlatformSchema,
  listPlatformsQuerySchema,
  comparePlatformsQuerySchema,
  platformIdParamSchema,
  platformSlugParamSchema,
} = require('./platform.validation');

const router = express.Router();

// ---- Public ----
router.get('/', validate(listPlatformsQuerySchema, 'query'), platformController.listPlatforms);
router.get(
  '/compare',
  validate(comparePlatformsQuerySchema, 'query'),
  platformController.comparePlatforms
);
router.get(
  '/:slug',
  validate(platformSlugParamSchema, 'params'),
  platformController.getPlatformBySlug
);

// ---- Admin ----
router.post(
  '/',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  validate(createPlatformSchema),
  platformController.createPlatform
);
router.put(
  '/:id',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  validate(platformIdParamSchema, 'params'),
  validate(updatePlatformSchema),
  platformController.updatePlatform
);
router.delete(
  '/:id',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  validate(platformIdParamSchema, 'params'),
  platformController.deactivatePlatform
);

module.exports = router;