/**
 * progress.controller.js
 * -----------------------------------------
 * HTTP layer for Progress Tracking endpoints.
 */

const asyncHandler = require('../../shared/helpers/asyncHandler');
const ApiResponse = require('../../shared/responses/ApiResponse');
const progressService = require('./progress.service');

const create = asyncHandler(async (req, res) => {
  const progress = await progressService.create(req.user.id, req.body);
  return ApiResponse.created(res, 'Progress entry created successfully', { progress });
});

const update = asyncHandler(async (req, res) => {
  const progress = await progressService.update(req.params.id, req.user.id, req.body);
  return ApiResponse.ok(res, 'Progress updated successfully', { progress });
});

const getAllForUser = asyncHandler(async (req, res) => {
  const { items, pagination } = await progressService.getAllForUser(req.user.id, req.query);
  return ApiResponse.ok(res, 'Progress entries fetched successfully', { progress: items }, pagination);
});

const getRoadmapSummary = asyncHandler(async (req, res) => {
  const summary = await progressService.getRoadmapSummary(req.params.roadmapId, req.user.id);
  return ApiResponse.ok(res, 'Roadmap progress summary fetched successfully', summary);
});

module.exports = {
  create,
  update,
  getAllForUser,
  getRoadmapSummary,
};