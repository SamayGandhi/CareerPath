/**
 * recommendation.controller.js
 * -----------------------------------------
 * HTTP layer for the Recommendation Engine.
 * UPDATED (AI Enhancement Module): regenerateExplanation is now a real
 * implementation — replaces the honest 503 stub from Phase 7 now that
 * the AI Enhancement Layer exists. Still honestly returns 503 if AI is
 * genuinely unavailable, but now ACTUALLY TRIES first.
 */

const asyncHandler = require('../../shared/helpers/asyncHandler');
const ApiResponse = require('../../shared/responses/ApiResponse');
const recommendationService = require('./recommendation.service');

const generate = asyncHandler(async (req, res) => {
  const recommendation = await recommendationService.generate(
    req.user.id,
    req.body.skillGapReportId
  );
  return ApiResponse.created(res, 'Recommendations generated successfully', { recommendation });
});

const getLatest = asyncHandler(async (req, res) => {
  const recommendation = await recommendationService.getLatest(req.user.id);
  return ApiResponse.ok(res, 'Latest recommendation fetched successfully', { recommendation });
});

const getHistory = asyncHandler(async (req, res) => {
  const { items, pagination } = await recommendationService.getHistory(req.user.id, req.query);
  return ApiResponse.ok(
    res,
    'Recommendation history fetched successfully',
    { recommendations: items },
    pagination
  );
});

const getById = asyncHandler(async (req, res) => {
  const recommendation = await recommendationService.getById(req.params.id, req.user);
  return ApiResponse.ok(res, 'Recommendation fetched successfully', { recommendation });
});

const regenerateExplanation = asyncHandler(async (req, res) => {
  const recommendation = await recommendationService.regenerateExplanation(req.params.id, req.user);
  return ApiResponse.ok(res, 'AI explanation regenerated successfully', { recommendation });
});

module.exports = {
  generate,
  getLatest,
  getHistory,
  getById,
  regenerateExplanation,
};