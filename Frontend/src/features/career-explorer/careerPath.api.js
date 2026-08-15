/**
 * careerPath.api.js
 * -----------------------------------------
 * API calls for the Career Paths module, matching approved API
 * Contract Module 5.
 */

import { apiRequest } from '../../lib/queryClient';

export const careerPathApi = {
  list: (params = {}) => apiRequest({ method: 'GET', url: '/career-paths', params }),

  getBySlug: (slug) => apiRequest({ method: 'GET', url: `/career-paths/${slug}` }),
};