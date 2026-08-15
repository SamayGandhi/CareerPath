/**
 * routes/index.js
 * -----------------------------------------
 * Central route aggregator. All module routers are mounted here.
 * FINAL STATE: health-check + Auth + User + Profile + Skill Taxonomy +
 * Career Paths + Assessment + Skill Gap Engine + Platform + Course +
 * Recommendation Engine + Roadmap Engine + Progress Tracking +
 * Dashboard + Resume Analyzer + GitHub Analyzer + Portfolio Analyzer +
 * Interview Preparation + Notifications + Reviews + Admin Panel
 * modules. All phases from the approved Development Roadmap (excluding
 * the explicitly-deferred AI Enhancement Layer, Phase 11) are now
 * implemented. The backend is feature-complete.
 */

const express = require('express');
const ApiResponse = require('../shared/responses/ApiResponse');
const mongoose = require('mongoose');

const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/user/user.routes');
const profileRoutes = require('../modules/profile/profile.routes');
const skillTaxonomyRoutes = require('../modules/skill-taxonomy/skillTaxonomy.routes');
const careerPathRoutes = require('../modules/career-path/careerPath.routes');
const assessmentRoutes = require('../modules/assessment/assessment.routes');
const skillGapRoutes = require('../modules/skill-gap-engine/skillGap.routes');
const platformRoutes = require('../modules/platform/platform.routes');
const courseRoutes = require('../modules/course/course.routes');
const recommendationRoutes = require('../modules/recommendation-engine/recommendation.routes');
const roadmapRoutes = require('../modules/roadmap-engine/roadmap.routes');
const progressRoutes = require('../modules/progress-tracker/progress.routes');
const dashboardRoutes = require('../modules/dashboard/dashboard.routes');
const resumeAnalyzerRoutes = require('../modules/resume-analyzer/resumeAnalyzer.routes');
const githubAnalyzerRoutes = require('../modules/github-analyzer/githubAnalyzer.routes');
const portfolioAnalyzerRoutes = require('../modules/portfolio-analyzer/portfolioAnalyzer.routes');
const interviewPrepRoutes = require('../modules/interview-prep/interviewPrep.routes');
const notificationRoutes = require('../modules/notification/notification.routes');
const reviewRoutes = require('../modules/review/review.routes');
const adminRoutes = require('../modules/admin/admin.routes');

const router = express.Router();

/**
 * GET /api/v1/health
 * Public health-check endpoint.
 */
router.get('/health', (req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const dbState = dbStates[mongoose.connection.readyState] || 'unknown';

  return ApiResponse.ok(res, 'Service is healthy', {
    status: 'up',
    database: dbState,
    timestamp: new Date().toISOString(),
    uptimeSeconds: process.uptime(),
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/profiles', profileRoutes);
router.use('/skills', skillTaxonomyRoutes);
router.use('/career-paths', careerPathRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/skill-gap', skillGapRoutes);
router.use('/platforms', platformRoutes);
router.use('/courses', courseRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/roadmap', roadmapRoutes);
router.use('/progress', progressRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/resume-analyzer', resumeAnalyzerRoutes);
router.use('/github-analyzer', githubAnalyzerRoutes);
router.use('/portfolio-analyzer', portfolioAnalyzerRoutes);
router.use('/interview-prep', interviewPrepRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reviews', reviewRoutes);
router.use('/admin', adminRoutes);

module.exports = router;