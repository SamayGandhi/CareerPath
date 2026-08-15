/**
 * githubAnalyzer.api.js
 * -----------------------------------------
 * API calls for the GitHub Analyzer module, matching approved API
 * Contract Module 14 exactly.
 */

import { apiRequest } from '../../lib/queryClient';

export const githubAnalyzerApi = {
  analyze: (githubUsername) =>
    apiRequest({ method: 'POST', url: '/github-analyzer/analyze', data: { githubUsername } }),

  getHistory: (params = {}) => apiRequest({ method: 'GET', url: '/github-analyzer/me/history', params }),
};