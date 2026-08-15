/**
 * NotificationsPage.jsx — Visual only.
 * ALL cursor-pagination, filter, mark-read/mark-all-read/delete logic
 * unchanged.
 */

import { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import Button from '../../../components/ui/atoms/Button';
import Spinner from '../../../components/ui/atoms/Spinner';
import EmptyState from '../../../components/ui/molecules/EmptyState';
import NotificationItem from './NotificationItem';
import { notificationsApi } from '../notifications.api';
import { useToast } from '../../../components/feedback/Toast';
import { classNames } from '../../../utils';

export default function NotificationsPage() {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    loadInitial();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadInitial() {
    setLoading(true);
    try {
      const { data, meta } = await notificationsApi.getMine({
        limit: 20,
        isRead: filter === 'unread' ? false : undefined,
      });
      setNotifications(data.notifications);
      setNextCursor(meta.nextCursor);
      setHasMore(meta.hasMore);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const { data, meta } = await notificationsApi.getMine({
        limit: 20,
        cursor: nextCursor,
        isRead: filter === 'unread' ? false : undefined,
      });
      setNotifications((prev) => [...prev, ...data.notifications]);
      setNextCursor(meta.nextCursor);
      setHasMore(meta.hasMore);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      showToast('All notifications marked as read', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationsApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-8">
      <div className="animate-fade-in-up flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-subtle">
            <Bell className="h-4.5 w-4.5 text-brand" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Notifications</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
          <CheckCheck className="h-4 w-4" /> Mark all read
        </Button>
      </div>

      <div className="flex gap-1 border-b border-border-subtle">
        {['all', 'unread'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={classNames(
              'border-b-2 px-4 py-2 text-sm font-medium capitalize transition-all duration-150',
              filter === f
                ? 'border-brand text-brand'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Spinner size={28} />
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />
      )}

      {!loading && notifications.length > 0 && (
        <div className="animate-fade-in-up flex flex-col divide-y divide-border-subtle rounded-lg border border-border-subtle bg-surface shadow-xs">
          {notifications.map((n) => (
            <NotificationItem key={n._id} notification={n} onMarkRead={handleMarkRead} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {hasMore && (
        <Button variant="secondary" onClick={loadMore} isLoading={loadingMore} className="self-center">
          Load More
        </Button>
      )}
    </div>
  );
}