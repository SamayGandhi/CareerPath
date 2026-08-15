/**
 * githubAnalyzer.controller.js
 * -----------------------------------------
 * HTTP layer for the GitHub Analyzer module.
 */

const asyncHandler = require('../../shared/helpers/asyncHandler');
const ApiResponse = require('../../shared/responses/ApiResponse');
const githubAnalyzerService = require('./githubAnalyzer.service');

const analyze = asyncHandler(async (req, res) => {
  const analysis = await githubAnalyzerService.analyze(req.user.id, req.body.githubUsername);
  return ApiResponse.created(res, 'GitHub profile analyzed successfully', { analysis });
});

const getHistory = asyncHandler(async (req, res) => {
  const { items, pagination } = await githubAnalyzerService.getHistory(req.user.id, req.query);
  return ApiResponse.ok(res, 'GitHub analysis history fetched successfully', { analyses: items }, pagination);
});

const getById = asyncHandler(async (req, res) => {
  const analysis = await githubAnalyzerService.getById(req.params.analysisId, req.user);
  return ApiResponse.ok(res, 'GitHub analysis fetched successfully', { analysis });
});

module.exports = { analyze, getHistory, getById };