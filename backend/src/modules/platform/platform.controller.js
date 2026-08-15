/**
 * platform.controller.js
 * -----------------------------------------
 * HTTP layer for Platform endpoints.
 */

const asyncHandler = require('../../shared/helpers/asyncHandler');
const ApiResponse = require('../../shared/responses/ApiResponse');
const platformService = require('./platform.service');

const createPlatform = asyncHandler(async (req, res) => {
  const platform = await platformService.createPlatform(req.body);
  return ApiResponse.created(res, 'Platform created successfully', { platform });
});

const listPlatforms = asyncHandler(async (req, res) => {
  const { items, pagination } = await platformService.listPlatforms(req.query);
  return ApiResponse.ok(res, 'Platforms fetched successfully', { platforms: items }, pagination);
});

const getPlatformBySlug = asyncHandler(async (req, res) => {
  const platform = await platformService.getBySlug(req.params.slug);
  return ApiResponse.ok(res, 'Platform fetched successfully', { platform });
});

const comparePlatforms = asyncHandler(async (req, res) => {
  const platforms = await platformService.comparePlatforms(req.query.ids);
  return ApiResponse.ok(res, 'Platforms compared successfully', { platforms });
});

const updatePlatform = asyncHandler(async (req, res) => {
  const platform = await platformService.updatePlatform(req.params.id, req.body);
  return ApiResponse.ok(res, 'Platform updated successfully', { platform });
});

const deactivatePlatform = asyncHandler(async (req, res) => {
  await platformService.deactivatePlatform(req.params.id);
  return ApiResponse.ok(res, 'Platform deactivated successfully', null);
});

module.exports = {
  createPlatform,
  listPlatforms,
  getPlatformBySlug,
  comparePlatforms,
  updatePlatform,
  deactivatePlatform,
};