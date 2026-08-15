/**
 * resumeAnalyzer.api.js
 * -----------------------------------------
 * API calls for the Resume Analyzer module, matching approved API
 * Contract Module 13 exactly.
 */

import { apiRequest } from '../../lib/queryClient';

export const resumeAnalyzerApi = {
  analyze: (file, targetCareerPathId) => {
    const formData = new FormData();
    formData.append('resume', file);
    if (targetCareerPathId) formData.append('targetCareerPathId', targetCareerPathId);

    return apiRequest({
      method: 'POST',
      url: '/resume-analyzer/analyze',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getHistory: (params = {}) => apiRequest({ method: 'GET', url: '/resume-analyzer/me/history', params }),

  getById: (analysisId) => apiRequest({ method: 'GET', url: `/resume-analyzer/${analysisId}` }),
};