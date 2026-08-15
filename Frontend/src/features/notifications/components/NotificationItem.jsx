/**
 * NotificationItem.jsx — BATCH 5 (visual only)
 * Refined unread-state and icon-circle treatment. ALL type icons
 * (including the 4 real triggers from Batch 5.4), mark-read/delete
 * handlers unchanged.
 */

import { Route, BookOpen, ClipboardList, Award, Bell, Trash2, FileText, Sparkles, MessagesSquare } from 'lucide-react';
import { formatRelativeTime, classNames } from '../../../utils';

const TYPE_ICONS = {
  roadmapReminder: Route,
  newCourseMatch: BookOpen,
  reassessmentDue: ClipboardList,
  stageCompleted: Award,
  assessmentCompleted: ClipboardList,
  recommendationReady: Sparkles,
  resumeAnalyzed: FileText,
  interviewCompleted: MessagesSquare,
  system: Bell,
};

export default function NotificationItem({ notification, onMarkRead, onDelete }) {
  const Icon = TYPE_ICONS[notification.type] || Bell;

  return (
    <div
      onClick={() => !notification.isRead && onMarkRead(notification._id)}
      className={classNames(
        'group flex items-start gap-3 rounded-md px-3 py-3 transition-colors duration-150',
        !notification.isRead && 'cursor-pointer bg-brand-subtle/60',
        notification.isRead && 'hover:bg-surface-secondary/50'
      )}
    >
      <div
        className={classNames(
          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          !notification.isRead ? 'bg-brand-subtle' : 'bg-surface-secondary'
        )}
      >
        <Icon className={classNames('h-4 w-4', !notification.isRead ? 'text-brand' : 'text-text-tertiary')} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-text-primary">{notification.title}</p>
        <p className="text-xs text-text-secondary">{notification.message}</p>
        <p className="mt-1 text-xs text-text-tertiary">{formatRelativeTime(notification.createdAt)}</p>
      </div>
      {!notification.isRead && <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notification._id);
        }}
        className="text-text-tertiary opacity-0 transition-opacity duration-150 hover:text-danger group-hover:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}