/**
 * skillGap.api.js
 * -----------------------------------------
 * API calls for the Skill Gap Engine module, matching approved API
 * Contract Module 6 exactly.
 */

import { apiRequest } from '../../lib/queryClient';

export const skillGapApi = {
  analyze: (targetCareerPathId) =>
    apiRequest({ method: 'POST', url: '/skill-gap/analyze', data: { targetCareerPathId } }),

  getLatest: (careerPathId) =>
    apiRequest({ method: 'GET', url: '/skill-gap/me/latest', params: { careerPathId } }),

  getHistory: (params = {}) => apiRequest({ method: 'GET', url: '/skill-gap/me/history', params }),

  getById: (reportId) => apiRequest({ method: 'GET', url: `/skill-gap/${reportId}` }),
};