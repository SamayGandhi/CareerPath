/**
 * auth.routes.js
 * -----------------------------------------
 * Authentication routes per approved API contract Module 1.
 * Applies stricter, endpoint-specific rate limits on top of the
 * global limiter (per contract Section A.9).
 */

const express = require('express');
const authController = require('./auth.controller');
const validate = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { createRateLimiter } = require('../../middlewares/rateLimiter.middleware');
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationSchema,
} = require('./auth.validation');

const router = express.Router();

// Per contract: 5 requests / 15 min on login & register
const authAttemptLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many attempts. Please try again in 15 minutes.',
});

// Per contract: 3 requests / 1 hour on forgot-password
const forgotPasswordLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many password reset requests. Please try again in an hour.',
});

router.post('/register', authAttemptLimiter, validate(registerSchema), authController.register);
router.post('/login', authAttemptLimiter, validate(loginSchema), authController.login);
router.post('/refresh-token', authController.refreshTokenHandler);
router.post('/logout', authController.logout);
router.post('/logout-all', authenticate, authController.logoutAll);
router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.get('/verify-email', authController.verifyEmail);
router.post(
  '/resend-verification',
  validate(resendVerificationSchema),
  authController.resendVerification
);

module.exports = router;