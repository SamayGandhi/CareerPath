/**
 * dashboard.routes.js
 * -----------------------------------------
 * Routes per approved API contract Module 11.
 */

const express = require('express');
const dashboardController = require('./dashboard.controller');
const validate = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { analyticsQuerySchema } = require('./dashboard.validation');

const router = express.Router();

router.use(authenticate);

router.get('/me', dashboardController.getSummary);
router.get('/me/analytics', validate(analyticsQuerySchema, 'query'), dashboardController.getAnalytics);

module.exports = router;