/**
 * admin.routes.js
 * -----------------------------------------
 * Routes per approved API contract Module 19. All routes require
 * admin authentication. CSV bulk-import uses in-memory multer storage
 * (small files, parsed directly from buffer, never persisted to disk).
 */

const express = require('express');
const multer = require('multer');
const adminController = require('./admin.controller');
const validate = require('../../middlewares/validate.middleware');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { USER_ROLES } = require('../../config/constants');
const ApiError = require('../../shared/errors/ApiError');
const {
  auditLogsQuerySchema,
  updateFeatureFlagSchema,
  aiLogsQuerySchema,
} = require('./admin.validation');

const router = express.Router();

router.use(authenticate, authorize(USER_ROLES.ADMIN));

const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB cap for CSV imports
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) {
      return cb(ApiError.badRequest('Only CSV files are accepted', 'INVALID_FILE_TYPE'));
    }
    cb(null, true);
  },
}).single('file');

function handleCsvUpload(req, res, next) {
  csvUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(ApiError.badRequest('CSV file too large. Max size is 2MB.', 'FILE_TOO_LARGE'));
      }
      return next(ApiError.badRequest(err.message, 'UPLOAD_ERROR'));
    }
    if (err) return next(err);
    next();
  });
}

router.get('/stats', adminController.getStats);
router.get('/audit-logs', validate(auditLogsQuerySchema, 'query'), adminController.getAuditLogs);
router.get('/ai-logs', validate(aiLogsQuerySchema, 'query'), adminController.getAiReliabilityLogs);
router.get('/system/feature-flags', adminController.getFeatureFlags);
router.patch(
  '/system/feature-flags',
  validate(updateFeatureFlagSchema),
  adminController.updateFeatureFlag
);
router.post('/courses/bulk-import', handleCsvUpload, adminController.bulkImportCourses);

module.exports = router;