/**
 * dashboard.controller.js
 * -----------------------------------------
 * HTTP layer for the Dashboard module.
 */

const asyncHandler = require('../../shared/helpers/asyncHandler');
const ApiResponse = require('../../shared/responses/ApiResponse');
const dashboardService = require('./dashboard.service');

const getSummary = asyncHandler(async (req, res) => {
  const summary = await dashboardService.getSummary(req.user.id);
  return ApiResponse.ok(res, 'Dashboard summary fetched successfully', summary);
});

const getAnalytics = asyncHandler(async (req, res) => {
  const analytics = await dashboardService.getAnalytics(req.user.id, req.query.range);
  return ApiResponse.ok(res, 'Dashboard analytics fetched successfully', analytics);
});

module.exports = {
  getSummary,
  getAnalytics,
};