/**
 * portfolioAnalyzer.controller.js
 * -----------------------------------------
 * HTTP layer for the Portfolio Analyzer module.
 */

const asyncHandler = require('../../shared/helpers/asyncHandler');
const ApiResponse = require('../../shared/responses/ApiResponse');
const portfolioAnalyzerService = require('./portfolioAnalyzer.service');

const analyze = asyncHandler(async (req, res) => {
  const analysis = await portfolioAnalyzerService.analyze(req.user.id, req.body.portfolioUrl);
  return ApiResponse.created(res, 'Portfolio analyzed successfully', { analysis });
});

const getHistory = asyncHandler(async (req, res) => {
  const { items, pagination } = await portfolioAnalyzerService.getHistory(req.user.id, req.query);
  return ApiResponse.ok(res, 'Portfolio analysis history fetched successfully', { analyses: items }, pagination);
});

const getById = asyncHandler(async (req, res) => {
  const analysis = await portfolioAnalyzerService.getById(req.params.analysisId, req.user);
  return ApiResponse.ok(res, 'Portfolio analysis fetched successfully', { analysis });
});

module.exports = { analyze, getHistory, getById };