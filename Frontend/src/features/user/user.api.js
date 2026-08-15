/**
 * user.api.js
 * -----------------------------------------
 * API calls for the User self-service module, matching approved API
 * Contract Module 2 exactly.
 */

import { apiRequest } from '../../lib/queryClient';

export const userApi = {
  getMe: () => apiRequest({ method: 'GET', url: '/users/me' }),

  updateMe: (payload) => apiRequest({ method: 'PATCH', url: '/users/me', data: payload }),

  changePassword: (payload) =>
    apiRequest({ method: 'PATCH', url: '/users/me/password', data: payload }),

  deleteMe: (password) =>
    apiRequest({ method: 'DELETE', url: '/users/me', data: { password } }),
};