/**
 * recommendations.api.js
 * -----------------------------------------
 * API calls for the Recommendation Engine module, matching approved
 * API Contract Module 7 exactly.
 * UPDATED (AI Enhancement Module): regenerateExplanation is now
 * actively used by RecommendationPage (previously defined but unused
 * since the backend endpoint was an honest 503 stub).
 */

import { apiRequest } from '../../lib/queryClient';

export const recommendationsApi = {
  generate: (skillGapReportId) =>
    apiRequest({ method: 'POST', url: '/recommendations/generate', data: { skillGapReportId } }),

  getLatest: () => apiRequest({ method: 'GET', url: '/recommendations/me/latest' }),

  getHistory: (params = {}) =>
    apiRequest({ method: 'GET', url: '/recommendations/me/history', params }),

  getById: (id) => apiRequest({ method: 'GET', url: `/recommendations/${id}` }),

  regenerateExplanation: (id) =>
    apiRequest({ method: 'POST', url: `/recommendations/${id}/regenerate-explanation` }),
};