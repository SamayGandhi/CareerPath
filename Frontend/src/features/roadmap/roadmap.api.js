/**
 * roadmap.api.js
 * -----------------------------------------
 * API calls for the Roadmap Engine module, matching approved API
 * Contract Module 8 exactly.
 */

import { apiRequest } from '../../lib/queryClient';

export const roadmapApi = {
  generate: (recommendationId, force = false) =>
    apiRequest({ method: 'POST', url: '/roadmap/generate', data: { recommendationId, force } }),

  getActive: () => apiRequest({ method: 'GET', url: '/roadmap/me/active' }),

  getAll: (params = {}) => apiRequest({ method: 'GET', url: '/roadmap/me', params }),

  getById: (id) => apiRequest({ method: 'GET', url: `/roadmap/${id}` }),

  updateStageStatus: (roadmapId, stageId, status) =>
    apiRequest({ method: 'PATCH', url: `/roadmap/${roadmapId}/stages/${stageId}`, data: { status } }),

  regenerate: (id) => apiRequest({ method: 'POST', url: `/roadmap/${id}/regenerate` }),

  abandon: (id) => apiRequest({ method: 'PATCH', url: `/roadmap/${id}/abandon` }),
};