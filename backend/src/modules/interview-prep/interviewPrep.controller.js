/**
 * interviewPrep.controller.js
 * -----------------------------------------
 * HTTP layer for the Interview Preparation module.
 */

const asyncHandler = require('../../shared/helpers/asyncHandler');
const ApiResponse = require('../../shared/responses/ApiResponse');
const interviewPrepService = require('./interviewPrep.service');

const getPracticeQuestions = asyncHandler(async (req, res) => {
  const questions = await interviewPrepService.getPracticeQuestions(req.query);
  return ApiResponse.ok(res, 'Practice questions fetched successfully', { questions });
});

const startMockTest = asyncHandler(async (req, res) => {
  const { attemptId, questions } = await interviewPrepService.startMockTest(req.user.id, req.body);
  return ApiResponse.created(res, 'Mock test started successfully', { attemptId, questions });
});

const submitMockTest = asyncHandler(async (req, res) => {
  const result = await interviewPrepService.submitMockTest(
    req.params.attemptId,
    req.user.id,
    req.body
  );
  return ApiResponse.ok(res, 'Mock test submitted successfully', result);
});

const getAttemptHistory = asyncHandler(async (req, res) => {
  const { items, pagination } = await interviewPrepService.getAttemptHistory(req.user.id, req.query);
  return ApiResponse.ok(res, 'Attempt history fetched successfully', { attempts: items }, pagination);
});

const getReadinessScore = asyncHandler(async (req, res) => {
  const result = await interviewPrepService.getReadinessScore(req.user.id, req.query.careerPathId);
  return ApiResponse.ok(res, 'Readiness score fetched successfully', result);
});

// ---- Admin ----

const createQuestion = asyncHandler(async (req, res) => {
  const question = await interviewPrepService.createQuestion(req.body);
  return ApiResponse.created(res, 'Question created successfully', { question });
});

const updateQuestion = asyncHandler(async (req, res) => {
  const question = await interviewPrepService.updateQuestion(req.params.id, req.body);
  return ApiResponse.ok(res, 'Question updated successfully', { question });
});

const deactivateQuestion = asyncHandler(async (req, res) => {
  await interviewPrepService.deactivateQuestion(req.params.id);
  return ApiResponse.ok(res, 'Question deactivated successfully', null);
});

module.exports = {
  getPracticeQuestions,
  startMockTest,
  submitMockTest,
  getAttemptHistory,
  getReadinessScore,
  createQuestion,
  updateQuestion,
  deactivateQuestion,
};