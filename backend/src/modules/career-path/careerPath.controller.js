/**
 * careerPath.controller.js
 * -----------------------------------------
 * HTTP layer for Career Path endpoints.
 */

const asyncHandler = require('../../shared/helpers/asyncHandler');
const ApiResponse = require('../../shared/responses/ApiResponse');
const careerPathService = require('./careerPath.service');

const createCareerPath = asyncHandler(async (req, res) => {
  const careerPath = await careerPathService.createCareerPath(req.body);
  return ApiResponse.created(res, 'Career path created successfully', { careerPath });
});

const listCareerPaths = asyncHandler(async (req, res) => {
  const { items, pagination } = await careerPathService.listCareerPaths(req.query);
  return ApiResponse.ok(
    res,
    'Career paths fetched successfully',
    { careerPaths: items },
    pagination
  );
});

const getCareerPathBySlug = asyncHandler(async (req, res) => {
  const careerPath = await careerPathService.getBySlug(req.params.slug);
  return ApiResponse.ok(res, 'Career path fetched successfully', { careerPath });
});

const updateCareerPath = asyncHandler(async (req, res) => {
  const careerPath = await careerPathService.updateCareerPath(req.params.id, req.body);
  return ApiResponse.ok(res, 'Career path updated successfully', { careerPath });
});

const deactivateCareerPath = asyncHandler(async (req, res) => {
  await careerPathService.deactivateCareerPath(req.params.id);
  return ApiResponse.ok(res, 'Career path deactivated successfully', null);
});

module.exports = {
  createCareerPath,
  listCareerPaths,
  getCareerPathBySlug,
  updateCareerPath,
  deactivateCareerPath,
};