/**
 * notification.controller.js
 * -----------------------------------------
 * HTTP layer for the Notifications module.
 */

const asyncHandler = require('../../shared/helpers/asyncHandler');
const ApiResponse = require('../../shared/responses/ApiResponse');
const notificationService = require('./notification.service');

const getMyNotifications = asyncHandler(async (req, res) => {
  const { items, nextCursor, hasMore } = await notificationService.getMyNotifications(
    req.user.id,
    req.query
  );

  return ApiResponse.ok(res, 'Notifications fetched successfully', { notifications: items }, {
    nextCursor,
    hasMore,
  });
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user.id);
  return ApiResponse.ok(res, 'Notification marked as read', { notification });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user.id);
  return ApiResponse.ok(res, 'All notifications marked as read', null);
});

const deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.params.id, req.user.id);
  return ApiResponse.ok(res, 'Notification deleted successfully', null);
});

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};