/**
 * skillGap.controller.js
 * -----------------------------------------
 * HTTP layer for the Skill Gap Engine.
 */

const asyncHandler = require('../../shared/helpers/asyncHandler');
const ApiResponse = require('../../shared/responses/ApiResponse');
const skillGapService = require('./skillGap.service');

const analyze = asyncHandler(async (req, res) => {
  const skillGapReport = await skillGapService.analyze(req.user.id, req.body.targetCareerPathId);
  return ApiResponse.created(res, 'Skill gap analysis completed successfully', {
    skillGapReport,
  });
});

const getLatest = asyncHandler(async (req, res) => {
  const skillGapReport = await skillGapService.getLatest(req.user.id, req.query.careerPathId);
  return ApiResponse.ok(res, 'Latest skill gap report fetched successfully', { skillGapReport });
});

const getHistory = asyncHandler(async (req, res) => {
  const { items, pagination } = await skillGapService.getHistory(req.user.id, req.query);
  return ApiResponse.ok(
    res,
    'Skill gap report history fetched successfully',
    { skillGapReports: items },
    pagination
  );
});

const getById = asyncHandler(async (req, res) => {
  const skillGapReport = await skillGapService.getById(req.params.reportId, req.user);
  return ApiResponse.ok(res, 'Skill gap report fetched successfully', { skillGapReport });
});

module.exports = {
  analyze,
  getLatest,
  getHistory,
  getById,
};