/**
 * careerPath.routes.js
 * -----------------------------------------
 * Routes per approved API contract Module 5. Public browsing (no auth
 * wall — supports SEO/discovery per approved UX spec), Admin/Content
 * Manager-gated mutations.
 */

const express = require('express');
const careerPathController = require('./careerPath.controller');
const validate = require('../../middlewares/validate.middleware');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { USER_ROLES } = require('../../config/constants');
const {
  createCareerPathSchema,
  updateCareerPathSchema,
  listCareerPathsQuerySchema,
  careerPathIdParamSchema,
  careerPathSlugParamSchema,
} = require('./careerPath.validation');

const router = express.Router();

// ---- Public ----
router.get('/', validate(listCareerPathsQuerySchema, 'query'), careerPathController.listCareerPaths);
router.get(
  '/:slug',
  validate(careerPathSlugParamSchema, 'params'),
  careerPathController.getCareerPathBySlug
);

// ---- Admin / Content Manager ----
router.post(
  '/',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.CONTENT_MANAGER),
  validate(createCareerPathSchema),
  careerPathController.createCareerPath
);
router.put(
  '/:id',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.CONTENT_MANAGER),
  validate(careerPathIdParamSchema, 'params'),
  validate(updateCareerPathSchema),
  careerPathController.updateCareerPath
);
router.delete(
  '/:id',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  validate(careerPathIdParamSchema, 'params'),
  careerPathController.deactivateCareerPath
);

module.exports = router;