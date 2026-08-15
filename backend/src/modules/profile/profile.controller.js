/**
 * profile.controller.js
 * -----------------------------------------
 * HTTP layer for the Profile module.
 */

const asyncHandler = require('../../shared/helpers/asyncHandler');
const ApiResponse = require('../../shared/responses/ApiResponse');
const ApiError = require('../../shared/errors/ApiError');
const profileService = require('./profile.service');

const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.getMyProfile(req.user.id);
  return ApiResponse.ok(res, 'Profile fetched successfully', { profile });
});

const createMyProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.createProfile(req.user.id, req.body);
  return ApiResponse.created(res, 'Profile created successfully', { profile });
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.updateMyProfile(req.user.id, req.body);
  return ApiResponse.ok(res, 'Profile updated successfully', { profile });
});

const updateTargetCareerPath = asyncHandler(async (req, res) => {
  const profile = await profileService.updateTargetCareerPath(
    req.user.id,
    req.body.careerPathId
  );
  return ApiResponse.ok(res, 'Target career path updated successfully', { profile });
});

const updateSkillProficiency = asyncHandler(async (req, res) => {
  const profile = await profileService.updateSkillProficiency(req.user.id, req.body);
  return ApiResponse.ok(res, 'Skill proficiency updated successfully', { profile });
});

const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('No resume file was uploaded', 'FILE_MISSING');
  }
  const result = await profileService.uploadResume(req.user.id, req.file);
  return ApiResponse.ok(res, 'Resume uploaded successfully', result);
});

const adminGetProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.adminGetProfileByUserId(req.params.userId);
  return ApiResponse.ok(res, 'Profile fetched successfully', { profile });
});

module.exports = {
  getMyProfile,
  createMyProfile,
  updateMyProfile,
  updateTargetCareerPath,
  updateSkillProficiency,
  uploadResume,
  adminGetProfile,
};