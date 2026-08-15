/**
 * auth.api.js
 * -----------------------------------------
 * API calls for the Authentication module, matching approved API
 * Contract Module 1 exactly (paths, methods, payload shapes).
 */

import { apiRequest } from '../../lib/queryClient';

export const authApi = {
  register: (payload) => apiRequest({ method: 'POST', url: '/auth/register', data: payload }),

  login: (payload) => apiRequest({ method: 'POST', url: '/auth/login', data: payload }),

  refreshToken: () => apiRequest({ method: 'POST', url: '/auth/refresh-token' }),

  logout: () => apiRequest({ method: 'POST', url: '/auth/logout' }),

  logoutAll: () => apiRequest({ method: 'POST', url: '/auth/logout-all' }),

  forgotPassword: (email) =>
    apiRequest({ method: 'POST', url: '/auth/forgot-password', data: { email } }),

  resetPassword: (payload) =>
    apiRequest({ method: 'POST', url: '/auth/reset-password', data: payload }),

  verifyEmail: (token) => apiRequest({ method: 'GET', url: `/auth/verify-email?token=${token}` }),

  resendVerification: (email) =>
    apiRequest({ method: 'POST', url: '/auth/resend-verification', data: { email } }),
};