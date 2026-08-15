/**
 * notification.routes.js
 * -----------------------------------------
 * Routes per approved API contract Module 17 (17.1-17.4). Endpoint
 * 17.5 (system-internal creation) is intentionally NOT exposed as an
 * HTTP route — it's invoked via direct service calls from other
 * modules (see notification.service.js's notifyUser() and its usage
 * in roadmap.service.js below).
 */

const express = require('express');
const notificationController = require('./notification.controller');
const validate = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const {
  listNotificationsQuerySchema,
  notificationIdParamSchema,
} = require('./notification.validation');

const router = express.Router();

router.use(authenticate);

router.get('/me', validate(listNotificationsQuerySchema, 'query'), notificationController.getMyNotifications);
router.patch(
  '/:id/read',
  validate(notificationIdParamSchema, 'params'),
  notificationController.markAsRead
);
router.patch('/me/read-all', notificationController.markAllAsRead);
router.delete(
  '/:id',
  validate(notificationIdParamSchema, 'params'),
  notificationController.deleteNotification
);

module.exports = router;