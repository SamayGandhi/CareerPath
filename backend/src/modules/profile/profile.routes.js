/**
 * profile.routes.js
 * -----------------------------------------
 * Routes per approved API contract Module 3, plus the manual skill
 * proficiency update endpoint (4.5) which is documented under
 * Assessment in the contract but lives here since it mutates the
 * profile document directly.
 */

const express = require('express');
const profileController = require('./profile.controller');
const validate = require('../../middlewares/validate.middleware');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { handleResumeUpload } = require('../../middlewares/upload.middleware');
const { USER_ROLES } = require('../../config/constants');
const {
  createProfileSchema,
  updateProfileSchema,
  updateTargetCareerPathSchema,
  updateSkillProficiencySchema,
  userIdParamSchema,
} = require('./profile.validation');

const router = express.Router();

router.use(authenticate);

router.get('/me', profileController.getMyProfile);
router.post('/me', validate(createProfileSchema), profileController.createMyProfile);
router.put('/me', validate(updateProfileSchema), profileController.updateMyProfile);
router.patch(
  '/me/target-career-path',
  validate(updateTargetCareerPathSchema),
  profileController.updateTargetCareerPath
);
router.patch(
  '/me/skills',
  validate(updateSkillProficiencySchema),
  profileController.updateSkillProficiency
);
router.post('/me/resume', handleResumeUpload, profileController.uploadResume);

// ---- Admin ----
router.get(
  '/:userId',
  authorize(USER_ROLES.ADMIN),
  validate(userIdParamSchema, 'params'),
  profileController.adminGetProfile
);

module.exports = router;