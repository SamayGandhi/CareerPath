/**
 * notifications.api.js
 * -----------------------------------------
 * API calls for the Notifications module, matching approved API
 * Contract Module 17 exactly (cursor-based pagination).
 */

import { apiRequest } from '../../lib/queryClient';

export const notificationsApi = {
  getMine: (params = {}) => apiRequest({ method: 'GET', url: '/notifications/me', params }),

  markAsRead: (id) => apiRequest({ method: 'PATCH', url: `/notifications/${id}/read` }),

  markAllAsRead: () => apiRequest({ method: 'PATCH', url: '/notifications/me/read-all' }),

  deleteNotification: (id) => apiRequest({ method: 'DELETE', url: `/notifications/${id}` }),
};