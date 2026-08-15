/**
 * careerPath.repository.js
 * -----------------------------------------
 * Data-access layer for the CareerPath model.
 */

const CareerPath = require('./careerPath.model');

class CareerPathRepository {
  async create(data) {
    return CareerPath.create(data);
  }

  async findById(id) {
    return CareerPath.findById(id).exec();
  }

  async findByIdPopulated(id) {
    return CareerPath.findById(id)
      .populate('requiredSkills.skillId', 'skillName slug category difficultyLevel')
      .exec();
  }

  async findBySlugPopulated(slug) {
    return CareerPath.findOne({ slug, isActive: true })
      .populate('requiredSkills.skillId', 'skillName slug category difficultyLevel')
      .exec();
  }

  async existsBySlug(slug) {
    const count = await CareerPath.countDocuments({ slug });
    return count > 0;
  }

  async existsByTitle(title) {
    const count = await CareerPath.countDocuments({
      title: { $regex: `^${title}$`, $options: 'i' },
    });
    return count > 0;
  }

  async findAll({ filter = {}, page = 1, limit = 20, sort = { title: 1 } } = {}) {
    const skip = (page - 1) * limit;
    const [items, totalItems] = await Promise.all([
      CareerPath.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      CareerPath.countDocuments(filter),
    ]);
    return { items, totalItems };
  }

  async updateById(id, updateData) {
    const careerPath = await CareerPath.findById(id);
    if (!careerPath) return null;
    Object.assign(careerPath, updateData);
    return careerPath.save();
  }

  async deactivateById(id) {
    return CareerPath.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
  }
}

module.exports = new CareerPathRepository();