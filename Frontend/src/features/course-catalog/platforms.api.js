/**
 * platforms.api.js
 * -----------------------------------------
 * API calls for the Platform module, matching approved API Contract
 * Module 10 exactly.
 */

import { apiRequest } from '../../lib/queryClient';

export const platformsApi = {
  list: (params = {}) => apiRequest({ method: 'GET', url: '/platforms', params }),

  getBySlug: (slug) => apiRequest({ method: 'GET', url: `/platforms/${slug}` }),

  compare: (ids) => apiRequest({ method: 'GET', url: '/platforms/compare', params: { ids: ids.join(',') } }),
};