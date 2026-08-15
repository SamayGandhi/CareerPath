/**
 * notification.service.js
 * -----------------------------------------
 * Business logic for Notifications: client-facing retrieval/read-state
 * management, PLUS the internal creation API used by other modules
 * (e.g. Roadmap Engine on stage completion). This dual role is
 * intentional and matches the approved API contract's note that
 * endpoint 17.5 ("Create Notification") is system-internal, not
 * client-exposed — `notifyUser()` below IS that internal creation path,
 * called via direct service-to-service invocation rather than an HTTP
 * route.
 */

const notificationRepository = require('./notification.repository');
const ApiError = require('../../shared/errors/ApiError');

class NotificationService {
  /**
   * INTERNAL API — called by other modules' services (never by a
   * controller directly from a client request) to create a
   * notification as a side effect of some real platform event.
   */
  async notifyUser({ userId, type, title, message, relatedEntityType, relatedEntityId }) {
    return notificationRepository.create({
      userId,
      type,
      title,
      message,
      relatedEntityType,
      relatedEntityId,
    });
  }

  async getMyNotifications(userId, query) {
    const { cursor, limit, isRead } = query;
    const { items, nextCursor, hasMore } = await notificationRepository.findByUserCursorPaginated(
      userId,
      { cursor, limit, isRead }
    );

    return { items, nextCursor, hasMore };
  }

  async markAsRead(id, userId) {
    const notification = await notificationRepository.markAsRead(id, userId);
    if (!notification) {
      throw ApiError.notFound('Notification not found', 'NOTIFICATION_NOT_FOUND');
    }
    return notification;
  }

  async markAllAsRead(userId) {
    await notificationRepository.markAllAsRead(userId);
  }

  async deleteNotification(id, userId) {
    const deleted = await notificationRepository.deleteById(id, userId);
    if (!deleted) {
      throw ApiError.notFound('Notification not found', 'NOTIFICATION_NOT_FOUND');
    }
  }
}

module.exports = new NotificationService();