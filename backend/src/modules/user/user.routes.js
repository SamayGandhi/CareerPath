/**
 * user.routes.js
 * -----------------------------------------
 * Routes per approved API contract Module 2.
 */

const express = require('express');
const userController = require('./user.controller');
const validate = require('../../middlewares/validate.middleware');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { USER_ROLES } = require('../../config/constants');
const {
  updateMeSchema,
  changePasswordSchema,
  deleteAccountSchema,
  listUsersQuerySchema,
  adminUpdateUserSchema,
  userIdParamSchema,
} = require('./user.validation');

const router = express.Router();

// All routes below require authentication
router.use(authenticate);

router.get('/me', userController.getMe);
router.patch('/me', validate(updateMeSchema), userController.updateMe);
router.patch('/me/password', validate(changePasswordSchema), userController.changePassword);
router.delete('/me', validate(deleteAccountSchema), userController.deleteMe);

// ---- Admin-only ----
router.get(
  '/',
  authorize(USER_ROLES.ADMIN),
  validate(listUsersQuerySchema, 'query'),
  userController.listUsers
);
router.get(
  '/:userId',
  authorize(USER_ROLES.ADMIN),
  validate(userIdParamSchema, 'params'),
  userController.getUserById
);
router.patch(
  '/:userId',
  authorize(USER_ROLES.ADMIN),
  validate(userIdParamSchema, 'params'),
  validate(adminUpdateUserSchema),
  userController.updateUser
);

module.exports = router;