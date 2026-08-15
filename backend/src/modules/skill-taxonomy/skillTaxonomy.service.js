/**
 * skillTaxonomy.service.js
 * -----------------------------------------
 * Business logic for Skill Taxonomy management.
 */

const ApiError = require('../../shared/errors/ApiError');
const skillTaxonomyRepository = require('./skillTaxonomy.repository');
const slugify = require('../../shared/utils/slugify.util');
const { PAGINATION_DEFAULTS } = require('../../config/constants');

class SkillTaxonomyService {
  async createSkill(data) {
    const nameExists = await skillTaxonomyRepository.existsByName(data.skillName);
    if (nameExists) {
      throw ApiError.conflict('A skill with this name already exists', 'SKILL_ALREADY_EXISTS');
    }

    if (data.prerequisiteSkillIds && data.prerequisiteSkillIds.length > 0) {
      await this._validateSkillIdsExist(data.prerequisiteSkillIds);
    }

    const slug = await this._generateUniqueSlug(data.skillName);

    return skillTaxonomyRepository.create({ ...data, slug });
  }

  async getById(id) {
    const skill = await skillTaxonomyRepository.findByIdPopulated(id);
    if (!skill) {
      throw ApiError.notFound('Skill not found', 'SKILL_NOT_FOUND');
    }
    return skill;
  }

  async getBySlug(slug) {
    const skill = await skillTaxonomyRepository.findBySlug(slug);
    if (!skill) {
      throw ApiError.notFound('Skill not found', 'SKILL_NOT_FOUND');
    }
    return skill;
  }

  async listSkills(query) {
    const { page, limit, category, q } = query;

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (q) filter.$text = { $search: q };

    const { items, totalItems } = await skillTaxonomyRepository.findAll({
      filter,
      page: page || PAGINATION_DEFAULTS.DEFAULT_PAGE,
      limit: limit || PAGINATION_DEFAULTS.DEFAULT_LIMIT,
    });

    return {
      items,
      pagination: this._buildPagination(page, limit, totalItems),
    };
  }

  async updateSkill(id, updateData) {
    const existing = await skillTaxonomyRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('Skill not found', 'SKILL_NOT_FOUND');
    }

    if (updateData.prerequisiteSkillIds && updateData.prerequisiteSkillIds.length > 0) {
      if (updateData.prerequisiteSkillIds.includes(id)) {
        throw ApiError.badRequest('A skill cannot be its own prerequisite', 'INVALID_PREREQUISITE');
      }
      await this._validateSkillIdsExist(updateData.prerequisiteSkillIds);
    }

    // Regenerate slug only if the name changed
    if (updateData.skillName && updateData.skillName !== existing.skillName) {
      updateData.slug = await this._generateUniqueSlug(updateData.skillName, id);
    }

    return skillTaxonomyRepository.updateById(id, updateData);
  }

  async deactivateSkill(id) {
    const existing = await skillTaxonomyRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('Skill not found', 'SKILL_NOT_FOUND');
    }

    const referenceCount = await skillTaxonomyRepository.countReferencesInCareerPaths(id);
    if (referenceCount > 0) {
      throw ApiError.conflict(
        'This skill is referenced by active career paths and cannot be deleted. It has been deactivated instead where possible.',
        'SKILL_IN_USE'
      );
    }

    return skillTaxonomyRepository.deactivateById(id);
  }

  async _validateSkillIdsExist(ids) {
    const found = await skillTaxonomyRepository.findByIds(ids);
    if (found.length !== ids.length) {
      throw ApiError.badRequest(
        'One or more prerequisite skill IDs do not exist',
        'INVALID_SKILL_REFERENCE'
      );
    }
  }

  async _generateUniqueSlug(name, excludeId = null) {
    const baseSlug = slugify(name);
    let candidateSlug = baseSlug;
    let counter = 1;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existing = await skillTaxonomyRepository.findBySlug(candidateSlug);
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

module.exports = new SkillTaxonomyService();