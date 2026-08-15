/**
 * portfolioAnalyzer.api.js
 * -----------------------------------------
 * API calls for the Portfolio Analyzer module, matching approved API
 * Contract Module 15 exactly.
 */

import { apiRequest } from '../../lib/queryClient';

export const portfolioAnalyzerApi = {
  analyze: (portfolioUrl) =>
    apiRequest({ method: 'POST', url: '/portfolio-analyzer/analyze', data: { portfolioUrl } }),

  getHistory: (params = {}) => apiRequest({ method: 'GET', url: '/portfolio-analyzer/me/history', params }),
};