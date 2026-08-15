/**
 * profile.api.js
 * -----------------------------------------
 * API calls for the Profile module, matching approved API Contract
 * Module 3 exactly.
 */

import { apiRequest } from '../../lib/queryClient';

export const profileApi = {
  getMyProfile: () => apiRequest({ method: 'GET', url: '/profiles/me' }),

  createProfile: (payload) => apiRequest({ method: 'POST', url: '/profiles/me', data: payload }),

  updateProfile: (payload) => apiRequest({ method: 'PUT', url: '/profiles/me', data: payload }),

  updateTargetCareerPath: (careerPathId) =>
    apiRequest({ method: 'PATCH', url: '/profiles/me/target-career-path', data: { careerPathId } }),

  updateSkillProficiency: (skillId, proficiency) =>
    apiRequest({ method: 'PATCH', url: '/profiles/me/skills', data: { skillId, proficiency } }),

  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return apiRequest({
      method: 'POST',
      url: '/profiles/me/resume',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};