/**
 * progress.api.js
 * -----------------------------------------
 * API calls for the Progress Tracking module, matching approved API
 * Contract Module 12 exactly.
 */

import { apiRequest } from '../../lib/queryClient';

export const progressApi = {
  getMine: (params = {}) => apiRequest({ method: 'GET', url: '/progress/me', params }),

  create: (payload) => apiRequest({ method: 'POST', url: '/progress', data: payload }),

  update: (id, payload) => apiRequest({ method: 'PATCH', url: `/progress/${id}`, data: payload }),

  getRoadmapSummary: (roadmapId) =>
    apiRequest({ method: 'GET', url: `/progress/roadmap/${roadmapId}/summary` }),
};