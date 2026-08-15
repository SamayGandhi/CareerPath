/**
 * skillAssessment.api.js
 * -----------------------------------------
 * API calls for the Skill Assessment module.
 * UPDATED (Batch 5.1): getQuestions now accepts an optional params
 * object (careerPathId, limit) alongside the existing type parameter —
 * additive, backward-compatible with any existing call site.
 */

import { apiRequest } from '../../lib/queryClient';

export const skillAssessmentApi = {
  getQuestions: (type = 'initialOnboarding', params = {}) =>
    apiRequest({
      method: 'GET',
      url: '/assessments/questions',
      params: { type, ...params },
    }),

  submit: (payload) => apiRequest({ method: 'POST', url: '/assessments', data: payload }),

  getHistory: (params = {}) => apiRequest({ method: 'GET', url: '/assessments/me', params }),

  getById: (assessmentId) => apiRequest({ method: 'GET', url: `/assessments/${assessmentId}` }),
};