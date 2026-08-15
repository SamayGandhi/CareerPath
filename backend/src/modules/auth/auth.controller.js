/**
 * auth.controller.js
 * -----------------------------------------
 * Thin HTTP layer: extracts request data, calls auth.service, sets
 * the refresh-token cookie, and returns the standardized response
 * envelope. Contains zero business logic.
 */

const asyncHandler = require('../../shared/helpers/asyncHandler');
const ApiResponse = require('../../shared/responses/ApiResponse');
const authService = require('./auth.service');
const env = require('../../config/env.config');
const tokenUtil = require('./token.util');
const { COOKIE_NAMES } = require('../../config/constants');

/**
 * Builds consistent, secure cookie options for the refresh token.
 */
function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.IS_PRODUCTION,
    sameSite: env.IS_PRODUCTION ? 'strict' : 'lax',
    maxAge: tokenUtil.parseExpiryToMs(env.JWT_REFRESH_EXPIRY),
    path: '/api/v1/auth', // scoped narrowly — only sent to auth endpoints
  };
}

function getRequestMeta(req) {
  return {
    deviceInfo: req.headers['user-agent'] || 'unknown',
    ipAddress: req.ip,
  };
}

const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(
    req.body,
    getRequestMeta(req)
  );

  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, getRefreshCookieOptions());

  return ApiResponse.created(res, 'Account created successfully. Please verify your email.', {
    user,
    accessToken,
  });
});

const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(
    req.body,
    getRequestMeta(req)
  );

  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, getRefreshCookieOptions());

  return ApiResponse.ok(res, 'Login successful', { user, accessToken });
});

const refreshTokenHandler = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN];

  const { accessToken, refreshToken } = await authService.refreshToken(
    incomingToken,
    getRequestMeta(req)
  );

  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, getRefreshCookieOptions());

  return ApiResponse.ok(res, 'Token refreshed successfully', { accessToken });
});

const logout = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN];
  await authService.logout(incomingToken);

  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, { path: '/api/v1/auth' });

  return ApiResponse.ok(res, 'Logged out successfully', null);
});

const logoutAll = asyncHandler(async (req, res) => {
  await authService.logoutAll(req.user.id);

  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, { path: '/api/v1/auth' });

  return ApiResponse.ok(res, 'Logged out from all devices successfully', null);
});

const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);

  // Deliberately generic response regardless of whether the email exists
  return ApiResponse.ok(
    res,
    'If an account with that email exists, a password reset link has been sent.',
    null
  );
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  await authService.resetPassword(token, newPassword);

  return ApiResponse.ok(res, 'Password has been reset successfully. Please log in again.', null);
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;
  const user = await authService.verifyEmail(token);

  return ApiResponse.ok(res, 'Email verified successfully', { user });
});

const resendVerification = asyncHandler(async (req, res) => {
  await authService.resendVerification(req.body.email);

  return ApiResponse.ok(
    res,
    'If an account with that email exists and is unverified, a verification email has been sent.',
    null
  );
});

module.exports = {
  register,
  login,
  refreshTokenHandler,
  logout,
  logoutAll,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
};