/**
 * user.controller.js
 * -----------------------------------------
 * HTTP layer for user self-service and admin endpoints.
 * UPDATED (Phase 18): updateUser() now passes actor context (acting
 * admin's ID + IP) to the service so the audit log hook can record it.
 */

const asyncHandler = require('../../shared/helpers/asyncHandler');
const ApiResponse = require('../../shared/responses/ApiResponse');
const userService = require('./user.service');

const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getById(req.user.id);
  return ApiResponse.ok(res, 'User fetched successfully', { user });
});

const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateMe(req.user.id, req.body);
  return ApiResponse.ok(res, 'Profile updated successfully', { user });
});

const changePassword = asyncHandler(async (req, res) => {
  await userService.changePassword(req.user.id, req.body);
  return ApiResponse.ok(res, 'Password changed successfully', null);
});

const deleteMe = asyncHandler(async (req, res) => {
  await userService.deleteMe(req.user.id, req.body.password);
  return ApiResponse.ok(res, 'Account deleted successfully', null);
});

const listUsers = asyncHandler(async (req, res) => {
  const { items, pagination } = await userService.listUsers(req.query);
  return ApiResponse.ok(res, 'Users fetched successfully', { users: items }, pagination);
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.adminGetUserById(req.params.userId);
  return ApiResponse.ok(res, 'User fetched successfully', { user });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.adminUpdateUser(req.params.userId, req.body, {
    actorUserId: req.user.id,
    ipAddress: req.ip,
  });
  return ApiResponse.ok(res, 'User updated successfully', { user });
});

module.exports = {
  getMe,
  updateMe,
  changePassword,
  deleteMe,
  listUsers,
  getUserById,
  updateUser,
};