/**
 * course.service.js
 * -----------------------------------------
 * Business logic for Course management, browsing, search, and the
 * skill-based reverse lookup the Recommendation Engine will use.
 */

const ApiError = require('../../shared/errors/ApiError');
const courseRepository = require('./course.repository');
const platformService = require('../platform/platform.service');
const skillTaxonomyRepository = require('../skill-taxonomy/skillTaxonomy.repository');
const slugify = require('../../shared/utils/slugify.util');
const { PAGINATION_DEFAULTS } = require('../../config/constants');

class CourseService {
  async createCourse(data) {
    await platformService.assertExistsAndActive(data.platformId);
    await this._validateSkillsExist(data.skillsCovered);

    const slug = await this._generateUniqueSlug(data.title);
    return courseRepository.create({ ...data, slug });
  }

  async getById(id) {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw ApiError.notFound('Course not found', 'COURSE_NOT_FOUND');
    }
    return course;
  }

  async getBySlug(slug) {
    const course = await courseRepository.findBySlug(slug);
    if (!course) {
      throw ApiError.notFound('Course not found', 'COURSE_NOT_FOUND');
    }
    return course;
  }

  async listCourses(query) {
    const { page, limit, level, isFree, platformId, skillId, careerPathId, priceMin, priceMax, sortBy, order } =
      query;

    const filter = { isActive: true };
    if (level) filter.level = level;
    if (isFree !== undefined) filter['price.isFree'] = isFree;
    if (platformId) filter.platformId = platformId;
    if (skillId) filter.skillsCovered = skillId;
    if (careerPathId) filter.suitableForCareerPathIds = careerPathId;
    if (priceMin !== undefined || priceMax !== undefined) {
      filter['price.amount'] = {};
      if (priceMin !== undefined) filter['price.amount'].$gte = priceMin;
      if (priceMax !== undefined) filter['price.amount'].$lte = priceMax;
    }

    const sortFieldMap = {
      rating: 'rating',
      price: 'price.amount',
      createdAt: 'createdAt',
      enrollmentCount: 'enrollmentCount',
    };
    const sort = { [sortFieldMap[sortBy] || 'createdAt']: order === 'asc' ? 1 : -1 };

    const { items, totalItems } = await courseRepository.findAll({
      filter,
      page: page || PAGINATION_DEFAULTS.DEFAULT_PAGE,
      limit: limit || PAGINATION_DEFAULTS.DEFAULT_LIMIT,
      sort,
    });

    return { items, pagination: this._buildPagination(page, limit, totalItems) };
  }

  async searchCourses(query) {
    const { q, page, limit } = query;
    const { items, totalItems } = await courseRepository.searchByText(q, {
      page: page || PAGINATION_DEFAULTS.DEFAULT_PAGE,
      limit: limit || PAGINATION_DEFAULTS.DEFAULT_LIMIT,
    });

    return { items, pagination: this._buildPagination(page, limit, totalItems) };
  }

  /**
   * Public-facing + Recommendation-Engine-facing reverse lookup:
   * "which courses cover this skill?"
   */
  async getCoursesBySkill(skillId, query) {
    const { page, limit } = query;
    const { items, totalItems } = await courseRepository.findBySkillId(skillId, {
      page: page || PAGINATION_DEFAULTS.DEFAULT_PAGE,
      limit: limit || PAGINATION_DEFAULTS.DEFAULT_LIMIT,
    });

    return { items, pagination: this._buildPagination(page, limit, totalItems) };
  }

  async updateCourse(id, updateData) {
    const existing = await courseRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('Course not found', 'COURSE_NOT_FOUND');
    }

    if (updateData.platformId) {
      await platformService.assertExistsAndActive(updateData.platformId);
    }
    if (updateData.skillsCovered) {
      await this._validateSkillsExist(updateData.skillsCovered);
    }
    if (updateData.title && updateData.title !== existing.title) {
      updateData.slug = await this._generateUniqueSlug(updateData.title, id);
    }

    return courseRepository.updateById(id, updateData);
  }

  async deactivateCourse(id) {
    const existing = await courseRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('Course not found', 'COURSE_NOT_FOUND');
    }
    return courseRepository.deactivateById(id);
  }

  async _validateSkillsExist(skillIds) {
    const found = await skillTaxonomyRepository.findByIds(skillIds);
    if (found.length !== new Set(skillIds.map(String)).size) {
      throw ApiError.badRequest(
        'One or more skill IDs in skillsCovered do not exist',
        'INVALID_SKILL_REFERENCE'
      );
    }
  }

  async _generateUniqueSlug(title, excludeId = null) {
    const baseSlug = slugify(title);
    let candidateSlug = baseSlug;
    let counter = 1;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existing = await courseRepository.findBySlug(candidateSlug);
      if (!existing || (excludeId && existing._id.toString() === excludeId)) break;
      candidateSlug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    return candidateSlug;
  }

  _buildPagination(page, limit, totalItems) {
    return { page, limit, totalPages: Math.ceil(totalItems / limit), totalItems };
  }
}

module.exports = new CourseService();