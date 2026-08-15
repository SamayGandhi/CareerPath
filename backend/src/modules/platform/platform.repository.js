/**
 * platform.repository.js
 * -----------------------------------------
 * Data-access layer for the Platform model.
 */

const Platform = require('./platform.model');

class PlatformRepository {
  async create(data) {
    return Platform.create(data);
  }

  async findById(id) {
    return Platform.findById(id).exec();
  }

  async findBySlug(slug) {
    return Platform.findOne({ slug, isActive: true }).exec();
  }

  async findByIds(ids) {
    return Platform.find({ _id: { $in: ids }, isActive: true }).exec();
  }

  async existsBySlug(slug) {
    const count = await Platform.countDocuments({ slug });
    return count > 0;
  }

  async existsByName(name) {
    const count = await Platform.countDocuments({ name: { $regex: `^${name}$`, $options: 'i' } });
    return count > 0;
  }

  async findAll({ filter = {}, page = 1, limit = 20, sort = { name: 1 } } = {}) {
    const skip = (page - 1) * limit;
    const [items, totalItems] = await Promise.all([
      Platform.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      Platform.countDocuments(filter),
    ]);
    return { items, totalItems };
  }

  async updateById(id, updateData) {
    const platform = await Platform.findById(id);
    if (!platform) return null;
    Object.assign(platform, updateData);
    return platform.save();
  }

  async deactivateById(id) {
    return Platform.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
  }
}

module.exports = new PlatformRepository();