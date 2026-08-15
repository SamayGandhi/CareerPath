/**
 * careerPath.service.js
 * -----------------------------------------
 * Business logic for Career Path management.
 */

const ApiError = require('../../shared/errors/ApiError');
const careerPathRepository = require('./careerPath.repository');
const skillTaxonomyRepository = require('../skill-taxonomy/skillTaxonomy.repository');
const slugify = require('../../shared/utils/slugify.util');
const { PAGINATION_DEFAULTS } = require('../../config/constants');

class CareerPathService {
  async createCareerPath(data) {
    const titleExists = await careerPathRepository.existsByTitle(data.title);
    if (titleExists) {
      throw ApiError.conflict(
        'A career path with this title already exists',
        'CAREER_PATH_ALREADY_EXISTS'
      );
    }

    await this._validateRequiredSkillsExist(data.requiredSkills);
    this._validateWeightsReasonable(data.requiredSkills);

    const slug = await this._generateUniqueSlug(data.title);

    return careerPathRepository.create({ ...data, slug });
  }

  async getById(id) {
    const careerPath = await careerPathRepository.findByIdPopulated(id);
    if (!careerPath) {
      throw ApiError.notFound('Career path not found', 'CAREER_PATH_NOT_FOUND');
    }
    return careerPath;
  }

  async getBySlug(slug) {
    const careerPath = await careerPathRepository.findBySlugPopulated(slug);
    if (!careerPath) {
      throw ApiError.notFound('Career path not found', 'CAREER_PATH_NOT_FOUND');
    }
    return careerPath;
  }

  async listCareerPaths(query) {
    const { page, limit, industry, suitableForUserType, q } = query;

    const filter = { isActive: true };
    if (industry) filter.industry = industry;
    if (suitableForUserType) filter.suitableForUserTypes = suitableForUserType;
    if (q) filter.$text = { $search: q };

    const { items, totalItems } = await careerPathRepository.findAll({
      filter,
      page: page || PAGINATION_DEFAULTS.DEFAULT_PAGE,
      limit: limit || PAGINATION_DEFAULTS.DEFAULT_LIMIT,
    });

    return {
      items,
      pagination: this._buildPagination(page, limit, totalItems),
    };
  }

  async updateCareerPath(id, updateData) {
    const existing = await careerPathRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('Career path not found', 'CAREER_PATH_NOT_FOUND');
    }

    if (updateData.requiredSkills) {
      await this._validateRequiredSkillsExist(updateData.requiredSkills);
      this._validateWeightsReasonable(updateData.requiredSkills);
    }

    if (updateData.title && updateData.title !== existing.title) {
      updateData.slug = await this._generateUniqueSlug(updateData.title, id);
    }

    return careerPathRepository.updateById(id, updateData);
  }

  async deactivateCareerPath(id) {
    const existing = await careerPathRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('Career path not found', 'CAREER_PATH_NOT_FOUND');
    }
    return careerPathRepository.deactivateById(id);
  }

  /**
   * Used by the Profile module (and later the Skill Gap Engine) to
   * confirm a career path reference is valid and active before assignment.
   */
  async assertExistsAndActive(id) {
    const careerPath = await careerPathRepository.findById(id);
    if (!careerPath || !careerPath.isActive) {
      throw ApiError.notFound('Career path not found', 'CAREER_PATH_NOT_FOUND');
    }
    return careerPath;
  }

  async _validateRequiredSkillsExist(requiredSkills) {
    const skillIds = requiredSkills.map((s) => s.skillId);
    const found = await skillTaxonomyRepository.findByIds(skillIds);
    if (found.length !== new Set(skillIds.map(String)).size) {
      throw ApiError.badRequest(
        'One or more required skill IDs do not exist',
        'INVALID_SKILL_REFERENCE'
      );
    }
  }

  /**
   * Per architecture note: warns (via non-blocking log-level check is
   * intentionally NOT a hard error) if weights sum well past 1 — kept
   * as a soft validation since weight semantics are ultimately owned
   * by the Recommendation Engine's strategy design in Phase 7.
   */
  _validateWeightsReasonable(requiredSkills) {
    const totalWeight = requiredSkills.reduce((sum, s) => sum + s.weight, 0);
    if (totalWeight > requiredSkills.length) {
      throw ApiError.badRequest(
        'Required skill weights appear invalid (sum exceeds maximum possible)',
        'INVALID_SKILL_WEIGHTS'
      );
    }
  }

  async _generateUniqueSlug(title, excludeId = null) {
    const baseSlug = slugify(title);
    let candidateSlug = baseSlug;
    let counter = 1;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existing = await careerPathRepository.findBySlugPopulated(candidateSlug).catch(() => null);
      if (!existing || (excludeId && existing._id.toString() === excludeId)) {
        break;
      }
      candidateSlug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    return candidateSlug;
  }

  _buildPagination(page, limit, totalItems) {
    return {
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
    };
  }
}

module.exports = new CareerPathService();