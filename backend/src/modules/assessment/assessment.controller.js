/**
 * assessment.controller.js
 * -----------------------------------------
 * HTTP layer for the Skill Assessment module.
 * UPDATED (Batch 5.1): getQuestions now passes the full validated
 * query object (type + optional careerPathId/limit) instead of just
 * req.query.type, so the service can act on the new optional params.
 */

const asyncHandler = require('../../shared/helpers/asyncHandler');
const ApiResponse = require('../../shared/responses/ApiResponse');
const assessmentService = require('./assessment.service');

const getQuestions = asyncHandler(async (req, res) => {
  const questions = await assessmentService.getQuestions(req.query);
  return ApiResponse.ok(res, 'Assessment questions fetched successfully', { questions });
});

const submitAssessment = asyncHandler(async (req, res) => {
  const { assessment, derivedSkills } = await assessmentService.submitAssessment(
    req.user.id,
    req.body
  );
  return ApiResponse.created(res, 'Assessment submitted successfully', {
    assessment,
    derivedSkills,
  });
});

const getHistory = asyncHandler(async (req, res) => {
  const { items, pagination } = await assessmentService.getHistory(req.user.id, req.query);
  return ApiResponse.ok(res, 'Assessment history fetched successfully', { assessments: items }, pagination);
});

const getById = asyncHandler(async (req, res) => {
  const assessment = await assessmentService.getById(req.params.assessmentId, req.user);
  return ApiResponse.ok(res, 'Assessment fetched successfully', { assessment });
});

module.exports = {
  getQuestions,
  submitAssessment,
  getHistory,
  getById,
};