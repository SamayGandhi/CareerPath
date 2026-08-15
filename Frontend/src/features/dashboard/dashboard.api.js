/**
 * dashboard.api.js
 * -----------------------------------------
 * API calls for the Dashboard module, matching approved API Contract
 * Module 11.
 */

import { apiRequest } from '../../lib/queryClient';

export const dashboardApi = {
  getSummary: () => apiRequest({ method: 'GET', url: '/dashboard/me' }),

  getAnalytics: (range = '30d') =>
    apiRequest({ method: 'GET', url: '/dashboard/me/analytics', params: { range } }),
};