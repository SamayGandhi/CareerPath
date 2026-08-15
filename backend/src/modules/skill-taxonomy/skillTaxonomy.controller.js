/**
 * skillTaxonomy.controller.js
 * -----------------------------------------
 * HTTP layer for Skill Taxonomy endpoints.
 */

const asyncHandler = require('../../shared/helpers/asyncHandler');
const ApiResponse = require('../../shared/responses/ApiResponse');
const skillTaxonomyService = require('./skillTaxonomy.service');

const createSkill = asyncHandler(async (req, res) => {
  const skill = await skillTaxonomyService.createSkill(req.body);
  return ApiResponse.created(res, 'Skill created successfully', { skill });
});

const listSkills = asyncHandler(async (req, res) => {
  const { items, pagination } = await skillTaxonomyService.listSkills(req.query);
  return ApiResponse.ok(res, 'Skills fetched successfully', { skills: items }, pagination);
});

const getSkillBySlug = asyncHandler(async (req, res) => {
  const skill = await skillTaxonomyService.getBySlug(req.params.slug);
  return ApiResponse.ok(res, 'Skill fetched successfully', { skill });
});

const updateSkill = asyncHandler(async (req, res) => {
  const skill = await skillTaxonomyService.updateSkill(req.params.id, req.body);
  return ApiResponse.ok(res, 'Skill updated successfully', { skill });
});

const deactivateSkill = asyncHandler(async (req, res) => {
  await skillTaxonomyService.deactivateSkill(req.params.id);
  return ApiResponse.ok(res, 'Skill deactivated successfully', null);
});

module.exports = {
  createSkill,
  listSkills,
  getSkillBySlug,
  updateSkill,
  deactivateSkill,
};