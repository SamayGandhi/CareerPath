/**
 * course.controller.js
 * -----------------------------------------
 * HTTP layer for Course endpoints.
 */

const asyncHandler = require('../../shared/helpers/asyncHandler');
const ApiResponse = require('../../shared/responses/ApiResponse');
const courseService = require('./course.service');

const createCourse = asyncHandler(async (req, res) => {
  const course = await courseService.createCourse(req.body);
  return ApiResponse.created(res, 'Course created successfully', { course });
});

const listCourses = asyncHandler(async (req, res) => {
  const { items, pagination } = await courseService.listCourses(req.query);
  return ApiResponse.ok(res, 'Courses fetched successfully', { courses: items }, pagination);
});

const searchCourses = asyncHandler(async (req, res) => {
  const { items, pagination } = await courseService.searchCourses(req.query);
  return ApiResponse.ok(res, 'Course search completed successfully', { courses: items }, pagination);
});

const getCourseBySlug = asyncHandler(async (req, res) => {
  const course = await courseService.getBySlug(req.params.slug);
  return ApiResponse.ok(res, 'Course fetched successfully', { course });
});

const getCoursesBySkill = asyncHandler(async (req, res) => {
  const { items, pagination } = await courseService.getCoursesBySkill(req.params.skillId, req.query);
  return ApiResponse.ok(res, 'Courses fetched successfully', { courses: items }, pagination);
});

const updateCourse = asyncHandler(async (req, res) => {
  const course = await courseService.updateCourse(req.params.id, req.body);
  return ApiResponse.ok(res, 'Course updated successfully', { course });
});

const deactivateCourse = asyncHandler(async (req, res) => {
  await courseService.deactivateCourse(req.params.id);
  return ApiResponse.ok(res, 'Course deactivated successfully', null);
});

module.exports = {
  createCourse,
  listCourses,
  searchCourses,
  getCourseBySlug,
  getCoursesBySkill,
  updateCourse,
  deactivateCourse,
};