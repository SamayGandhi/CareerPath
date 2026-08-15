/**
 * notification.repository.js
 * -----------------------------------------
 * Data-access layer for the Notification model. REPLACES the interim
 * stub created in Phase 10 (which returned an empty list so the
 * Dashboard module could compose safely before this module existed).
 * The Dashboard's call site (`findRecentByUser`) is preserved exactly,
 * so no changes are needed there — only this file's implementation
 * becomes real.
 *
 * Uses cursor-based pagination for the main listing endpoint per the
 * approved API contract (Section A.5): the `cursor` is the last seen
 * notification's _id, and results page backward in time from there —
 * avoiding the skip() performance cliff on this ever-growing collection.
 */

const Notification = require('./notification.model');

class NotificationRepository {
  async create(data) {
    return Notification.create(data);
  }

  async findById(id) {
    return Notification.findById(id).exec();
  }

  /**
   * Cursor-paginated listing, newest first. `cursor` is a notification
   * _id; results are strictly older (createdAt/_id less) than the
   * cursor's document.
   */
  async findByUserCursorPaginated(userId, { cursor, limit = 20, isRead } = {}) {
    const filter = { userId };
    if (isRead !== undefined) filter.isRead = isRead;

    if (cursor) {
      filter._id = { $lt: cursor };
    }

    const items = await Notification.find(filter)
      .sort({ _id: -1 })
      .limit(limit + 1) // fetch one extra to know if there's a next page
      .exec();

    const hasMore = items.length > limit;
    const pageItems = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? pageItems[pageItems.length - 1]._id : null;

    return { items: pageItems, nextCursor, hasMore };
  }

  /**
   * Used by the Dashboard module (Phase 10) for its recent-activity
   * widget — simple, small, most-recent-N fetch, no pagination needed.
   */
  async findRecentByUser(userId, limit = 5) {
    return Notification.find({ userId }).sort({ createdAt: -1 }).limit(limit).exec();
  }

  async markAsRead(id, userId) {
    return Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    ).exec();
  }

  async markAllAsRead(userId) {
    return Notification.updateMany({ userId, isRead: false }, { isRead: true }).exec();
  }

  async deleteById(id, userId) {
    return Notification.findOneAndDelete({ _id: id, userId }).exec();
  }

  async countUnread(userId) {
    return Notification.countDocuments({ userId, isRead: false });
  }
}

module.exports = new NotificationRepository();