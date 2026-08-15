/**
 * resumeAnalyzer.controller.js
 * -----------------------------------------
 * HTTP layer for the Resume Analyzer module.
 */

const asyncHandler = require('../../shared/helpers/asyncHandler');
const ApiResponse = require('../../shared/responses/ApiResponse');
const resumeAnalyzerService = require('./resumeAnalyzer.service');

const analyze = asyncHandler(async (req, res) => {
  const analysis = await resumeAnalyzerService.analyze(req.user.id, req.file, req.body);
  return ApiResponse.created(res, 'Resume analyzed successfully', { analysis });
});

const getHistory = asyncHandler(async (req, res) => {
  const { items, pagination } = await resumeAnalyzerService.getHistory(req.user.id, req.query);
  return ApiResponse.ok(res, 'Resume analysis history fetched successfully', { analyses: items }, pagination);
});

const getById = asyncHandler(async (req, res) => {
  const analysis = await resumeAnalyzerService.getById(req.params.analysisId, req.user);
  return ApiResponse.ok(res, 'Resume analysis fetched successfully', { analysis });
});

module.exports = { analyze, getHistory, getById };