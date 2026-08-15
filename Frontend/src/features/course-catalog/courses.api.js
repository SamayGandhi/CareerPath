/**
 * courses.api.js
 * -----------------------------------------
 * API calls for the Course module, matching approved API Contract
 * Module 9 exactly.
 */

import { apiRequest } from '../../lib/queryClient';

export const coursesApi = {
  list: (params = {}) => apiRequest({ method: 'GET', url: '/courses', params }),

  search: (q, params = {}) => apiRequest({ method: 'GET', url: '/courses/search', params: { q, ...params } }),

  getBySlug: (slug) => apiRequest({ method: 'GET', url: `/courses/${slug}` }),

  getBySkill: (skillId, params = {}) =>
    apiRequest({ method: 'GET', url: `/courses/by-skill/${skillId}`, params }),
};