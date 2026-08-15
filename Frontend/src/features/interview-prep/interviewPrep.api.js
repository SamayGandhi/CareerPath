/**
 * interviewPrep.api.js
 * -----------------------------------------
 * API calls for the Interview Preparation module, matching approved
 * API Contract Module 16 exactly.
 */

import { apiRequest } from '../../lib/queryClient';

export const interviewPrepApi = {
  getPracticeQuestions: (params = {}) =>
    apiRequest({ method: 'GET', url: '/interview-prep/questions', params }),

  startMockTest: (payload) =>
    apiRequest({ method: 'POST', url: '/interview-prep/mock-test/start', data: payload }),

  submitMockTest: (attemptId, answers) =>
    apiRequest({
      method: 'POST',
      url: `/interview-prep/mock-test/${attemptId}/submit`,
      data: { answers },
    }),

  getAttemptHistory: (params = {}) =>
    apiRequest({ method: 'GET', url: '/interview-prep/attempts/me', params }),

  getReadinessScore: (careerPathId) =>
    apiRequest({
      method: 'GET',
      url: '/interview-prep/me/readiness-score',
      params: { careerPathId },
    }),
};