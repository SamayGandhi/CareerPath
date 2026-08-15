/**
 * admin.api.js
 * -----------------------------------------
 * API calls for the Admin Panel, matching approved API Contract
 * Module 19 exactly, plus admin-gated endpoints from Users (Module 2),
 * Skills (admin CRUD), Career Paths (5), Courses (9), Platforms (10),
 * Reviews (18.5), and Interview Prep question bank (16.6).
 * UPDATED: added Skill/CareerPath/Course/Platform/Question CRUD and
 * Reviews listing/moderation, needed for Content Management, Question
 * Bank, and Reviews Moderation tabs.
 */

import { apiRequest } from '../../lib/queryClient';

export const adminApi = {
  getStats: () => apiRequest({ method: 'GET', url: '/admin/stats' }),

  getAuditLogs: (params = {}) => apiRequest({ method: 'GET', url: '/admin/audit-logs', params }),

  getAiLogs: (params = {}) => apiRequest({ method: 'GET', url: '/admin/ai-logs', params }),

  getFeatureFlags: () => apiRequest({ method: 'GET', url: '/admin/system/feature-flags' }),

  updateFeatureFlag: (key, enabled) =>
    apiRequest({ method: 'PATCH', url: '/admin/system/feature-flags', data: { key, enabled } }),

  bulkImportCourses: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest({
      method: 'POST',
      url: '/admin/courses/bulk-import',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // ---- Users ----
  listUsers: (params = {}) => apiRequest({ method: 'GET', url: '/users', params }),
  updateUser: (userId, payload) => apiRequest({ method: 'PATCH', url: `/users/${userId}`, data: payload }),

  // ---- Skills ----
  listSkills: (params = {}) => apiRequest({ method: 'GET', url: '/skills', params }),
  createSkill: (payload) => apiRequest({ method: 'POST', url: '/skills', data: payload }),
  updateSkill: (id, payload) => apiRequest({ method: 'PUT', url: `/skills/${id}`, data: payload }),
  deactivateSkill: (id) => apiRequest({ method: 'DELETE', url: `/skills/${id}` }),

  // ---- Career Paths ----
  listCareerPaths: (params = {}) => apiRequest({ method: 'GET', url: '/career-paths', params }),
  createCareerPath: (payload) => apiRequest({ method: 'POST', url: '/career-paths', data: payload }),
  updateCareerPath: (id, payload) => apiRequest({ method: 'PUT', url: `/career-paths/${id}`, data: payload }),
  deactivateCareerPath: (id) => apiRequest({ method: 'DELETE', url: `/career-paths/${id}` }),

  // ---- Courses ----
  listCourses: (params = {}) => apiRequest({ method: 'GET', url: '/courses', params }),
  updateCourse: (id, payload) => apiRequest({ method: 'PUT', url: `/courses/${id}`, data: payload }),
  deactivateCourse: (id) => apiRequest({ method: 'DELETE', url: `/courses/${id}` }),

  // ---- Platforms ----
  listPlatforms: (params = {}) => apiRequest({ method: 'GET', url: '/platforms', params }),
  createPlatform: (payload) => apiRequest({ method: 'POST', url: '/platforms', data: payload }),
  updatePlatform: (id, payload) => apiRequest({ method: 'PUT', url: `/platforms/${id}`, data: payload }),
  deactivatePlatform: (id) => apiRequest({ method: 'DELETE', url: `/platforms/${id}` }),

  // ---- Interview Question Bank ----
  listQuestions: (params = {}) => apiRequest({ method: 'GET', url: '/interview-prep/questions', params }),
  createQuestion: (payload) => apiRequest({ method: 'POST', url: '/interview-prep/questions', data: payload }),
  updateQuestion: (id, payload) =>
    apiRequest({ method: 'PUT', url: `/interview-prep/questions/${id}`, data: payload }),
  deactivateQuestion: (id) => apiRequest({ method: 'DELETE', url: `/interview-prep/questions/${id}` }),

  // ---- Reviews moderation ----
  listReviewsByTarget: (targetType, targetId, params = {}) =>
    apiRequest({ method: 'GET', url: '/reviews', params: { targetType, targetId, ...params } }),
  moderateDeleteReview: (reviewId) =>
    apiRequest({ method: 'DELETE', url: `/reviews/${reviewId}/moderate` }),
};