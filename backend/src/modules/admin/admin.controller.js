/**
 * admin.controller.js
 * -----------------------------------------
 * HTTP layer for the Admin Panel module.
 */

const asyncHandler = require('../../shared/helpers/asyncHandler');
const ApiResponse = require('../../shared/responses/ApiResponse');
const ApiError = require('../../shared/errors/ApiError');
const adminService = require('./admin.service');
const { recordAuditLog } = require('../../shared/helpers/auditLogger.helper');

const getStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getStats();
  return ApiResponse.ok(res, 'Admin stats fetched successfully', stats);
});

const getAuditLogs = asyncHandler(async (req, res) => {
  const { items, pagination } = await adminService.getAuditLogs(req.query);
  return ApiResponse.ok(res, 'Audit logs fetched successfully', { auditLogs: items }, pagination);
});

const getAiReliabilityLogs = asyncHandler(async (req, res) => {
  const result = await adminService.getAiReliabilityLogs(req.query);
  return ApiResponse.ok(res, 'AI reliability data fetched', result);
});

const getFeatureFlags = asyncHandler(async (req, res) => {
  const flags = await adminService.getFeatureFlags();
  return ApiResponse.ok(res, 'Feature flags fetched successfully', { flags });
});

const updateFeatureFlag = asyncHandler(async (req, res) => {
  const { key, enabled } = req.body;
  const flag = await adminService.updateFeatureFlag(key, enabled, req.user.id);

  await recordAuditLog({
    actorUserId: req.user.id,
    action: 'FEATURE_FLAG_UPDATED',
    targetEntityType: 'FeatureFlag',
    targetEntityId: flag._id,
    metadata: { key, enabled },
    ipAddress: req.ip,
  });

  return ApiResponse.ok(res, 'Feature flag updated successfully', { flag });
});

const bulkImportCourses = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('No CSV file was uploaded', 'FILE_MISSING');
  }

  const result = await adminService.bulkImportCourses(req.file.buffer);

  await recordAuditLog({
    actorUserId: req.user.id,
    action: 'COURSES_BULK_IMPORTED',
    metadata: {
      importedCount: result.importedCount,
      skippedCount: result.skippedCount,
    },
    ipAddress: req.ip,
  });

  return ApiResponse.ok(res, 'Bulk import completed', result);
});

module.exports = {
  getStats,
  getAuditLogs,
  getAiReliabilityLogs,
  getFeatureFlags,
  updateFeatureFlag,
  bulkImportCourses,
};