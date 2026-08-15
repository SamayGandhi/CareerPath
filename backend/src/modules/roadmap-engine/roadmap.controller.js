/**
 * roadmap.controller.js
 * -----------------------------------------
 * HTTP layer for the Roadmap Engine.
 */

const asyncHandler = require('../../shared/helpers/asyncHandler');
const ApiResponse = require('../../shared/responses/ApiResponse');
const roadmapService = require('./roadmap.service');

const generate = asyncHandler(async (req, res) => {
  const roadmap = await roadmapService.generate(req.user.id, req.body);
  return ApiResponse.created(res, 'Roadmap generated successfully', { roadmap });
});

const getActive = asyncHandler(async (req, res) => {
  const roadmap = await roadmapService.getActive(req.user.id);
  return ApiResponse.ok(res, 'Active roadmap fetched successfully', { roadmap });
});

const getAllForUser = asyncHandler(async (req, res) => {
  const { items, pagination } = await roadmapService.getAllForUser(req.user.id, req.query);
  return ApiResponse.ok(res, 'Roadmaps fetched successfully', { roadmaps: items }, pagination);
});

const getById = asyncHandler(async (req, res) => {
  const roadmap = await roadmapService.getById(req.params.id, req.user);
  return ApiResponse.ok(res, 'Roadmap fetched successfully', { roadmap });
});

const updateStageStatus = asyncHandler(async (req, res) => {
  const roadmap = await roadmapService.updateStageStatus(
    req.params.id,
    req.params.stageId,
    req.body.status,
    req.user.id
  );
  return ApiResponse.ok(res, 'Stage status updated successfully', { roadmap });
});

const regenerate = asyncHandler(async (req, res) => {
  const roadmap = await roadmapService.regenerate(req.params.id, req.user.id);
  return ApiResponse.ok(res, 'Roadmap regenerated successfully', { roadmap });
});

const abandon = asyncHandler(async (req, res) => {
  const roadmap = await roadmapService.abandon(req.params.id, req.user.id);
  return ApiResponse.ok(res, 'Roadmap abandoned successfully', { roadmap });
});

module.exports = {
  generate,
  getActive,
  getAllForUser,
  getById,
  updateStageStatus,
  regenerate,
  abandon,
};