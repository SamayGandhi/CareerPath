/**
 * skillTaxonomy.routes.js
 * -----------------------------------------
 * Public read routes + Admin/ContentManager-only CRUD routes.
 * Mounted at /api/v1/admin/skill-taxonomy for mutation endpoints per
 * approved API contract Module 19.3, and publicly at a read-only
 * catalog path for browsing.
 */

const express = require('express');
const skillTaxonomyController = require('./skillTaxonomy.controller');
const validate = require('../../middlewares/validate.middleware');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { USER_ROLES } = require('../../config/constants');
const {
  createSkillSchema,
  updateSkillSchema,
  listSkillsQuerySchema,
  skillIdParamSchema,
  skillSlugParamSchema,
} = require('./skillTaxonomy.validation');

const router = express.Router();

// ---- Public ----
router.get('/', validate(listSkillsQuerySchema, 'query'), skillTaxonomyController.listSkills);
router.get(
  '/:slug',
  validate(skillSlugParamSchema, 'params'),
  skillTaxonomyController.getSkillBySlug
);

// ---- Admin / Content Manager ----
router.post(
  '/',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.CONTENT_MANAGER),
  validate(createSkillSchema),
  skillTaxonomyController.createSkill
);
router.put(
  '/:id',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.CONTENT_MANAGER),
  validate(skillIdParamSchema, 'params'),
  validate(updateSkillSchema),
  skillTaxonomyController.updateSkill
);
router.delete(
  '/:id',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  validate(skillIdParamSchema, 'params'),
  skillTaxonomyController.deactivateSkill
);

module.exports = router;