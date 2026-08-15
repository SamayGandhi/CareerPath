/**
 * course.routes.js
 * -----------------------------------------
 * Routes per approved API contract Module 9. Static/prefixed paths
 * ('/search', '/by-skill/:skillId') are registered BEFORE the generic
 * '/:slug' route to prevent Express route-matching conflicts.
 */

const express = require('express');
const courseController = require('./course.controller');
const validate = require('../../middlewares/validate.middleware');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { USER_ROLES } = require('../../config/constants');
const {
  createCourseSchema,
  updateCourseSchema,
  listCoursesQuerySchema,
  searchCoursesQuerySchema,
  courseIdParamSchema,
  courseSlugParamSchema,
  skillIdParamSchema,
  bySkillQuerySchema,
} = require('./course.validation');

const router = express.Router();

// ---- Public ----
router.get('/', validate(listCoursesQuerySchema, 'query'), courseController.listCourses);
router.get('/search', validate(searchCoursesQuerySchema, 'query'), courseController.searchCourses);
router.get(
  '/by-skill/:skillId',
  validate(skillIdParamSchema, 'params'),
  validate(bySkillQuerySchema, 'query'),
  courseController.getCoursesBySkill
);
router.get('/:slug', validate(courseSlugParamSchema, 'params'), courseController.getCourseBySlug);

// ---- Admin / Content Manager ----
router.post(
  '/',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.CONTENT_MANAGER),
  validate(createCourseSchema),
  courseController.createCourse
);
router.put(
  '/:id',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.CONTENT_MANAGER),
  validate(courseIdParamSchema, 'params'),
  validate(updateCourseSchema),
  courseController.updateCourse
);
router.delete(
  '/:id',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  validate(courseIdParamSchema, 'params'),
  courseController.deactivateCourse
);

module.exports = router;