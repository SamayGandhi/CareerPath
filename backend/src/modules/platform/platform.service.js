/**
 * platform.service.js
 * -----------------------------------------
 * Business logic for Platform management.
 */

const ApiError = require('../../shared/errors/ApiError');
const platformRepository = require('./platform.repository');
const slugify = require('../../shared/utils/slugify.util');
const { PAGINATION_DEFAULTS } = require('../../config/constants');

class PlatformService {
  async createPlatform(data) {
    const nameExists = await platformRepository.existsByName(data.name);
    if (nameExists) {
      throw ApiError.conflict('A platform with this name already exists', 'PLATFORM_ALREADY_EXISTS');
    }

    const slug = await this._generateUniqueSlug(data.name);
    return platformRepository.create({ ...data, slug });
  }

  async getById(id) {
    const platform = await platformRepository.findById(id);
    if (!platform) {
      throw ApiError.notFound('Platform not found', 'PLATFORM_NOT_FOUND');
    }
    return platform;
  }

  async getBySlug(slug) {
    const platform = await platformRepository.findBySlug(slug);
    if (!platform) {
      throw ApiError.notFound('Platform not found', 'PLATFORM_NOT_FOUND');
    }
    return platform;
  }

  async listPlatforms(query) {
    const { page, limit, pricingModel } = query;

    const filter = { isActive: true };
    if (pricingModel) filter.pricingModel = pricingModel;

    const { items, totalItems } = await platformRepository.findAll({
      filter,
      page: page || PAGINATION_DEFAULTS.DEFAULT_PAGE,
      limit: limit || PAGINATION_DEFAULTS.DEFAULT_LIMIT,
    });

    return { items, pagination: this._buildPagination(page, limit, totalItems) };
  }

  async comparePlatforms(ids) {
    const platforms = await platformRepository.findByIds(ids);
    if (platforms.length !== ids.length) {
      throw ApiError.badRequest(
        'One or more platform IDs do not exist or are inactive',
        'INVALID_PLATFORM_REFERENCE'
      );
    }
    return platforms;
  }

  async updatePlatform(id, updateData) {
    const existing = await platformRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('Platform not found', 'PLATFORM_NOT_FOUND');
    }

    if (updateData.name && updateData.name !== existing.name) {
      updateData.slug = await this._generateUniqueSlug(updateData.name, id);
    }

    return platformRepository.updateById(id, updateData);
  }

  async deactivatePlatform(id) {
    const existing = await platformRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('Platform not found', 'PLATFORM_NOT_FOUND');
    }
    return platformRepository.deactivateById(id);
  }

  async assertExistsAndActive(id) {
    const platform = await platformRepository.findById(id);
    if (!platform || !platform.isActive) {
      throw ApiError.notFound('Platform not found', 'PLATFORM_NOT_FOUND');
    }
    return platform;
  }

  async _generateUniqueSlug(name, excludeId = null) {
    const baseSlug = slugify(name);
    let candidateSlug = baseSlug;
    let counter = 1;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existing = await platformRepository.findBySlug(candidateSlug);
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

module.exports = new PlatformService();