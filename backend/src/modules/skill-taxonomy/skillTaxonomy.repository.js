/**
 * skillTaxonomy.repository.js
 * -----------------------------------------
 * Data-access layer for the SkillTaxonomy model.
 */

const SkillTaxonomy = require('./skillTaxonomy.model');

class SkillTaxonomyRepository {
  async create(data) {
    return SkillTaxonomy.create(data);
  }

  async findById(id) {
    return SkillTaxonomy.findById(id).exec();
  }

  async findByIdPopulated(id) {
    return SkillTaxonomy.findById(id)
      .populate('prerequisiteSkillIds', 'skillName slug difficultyLevel')
      .populate('relatedCareerPathIds', 'title slug')
      .exec();
  }

  async findBySlug(slug) {
    return SkillTaxonomy.findOne({ slug, isActive: true }).exec();
  }

  async findByIds(ids) {
    return SkillTaxonomy.find({ _id: { $in: ids } }).exec();
  }

  async existsBySlug(slug) {
    const count = await SkillTaxonomy.countDocuments({ slug });
    return count > 0;
  }

  async existsByName(skillName) {
    const count = await SkillTaxonomy.countDocuments({
      skillName: { $regex: `^${skillName}$`, $options: 'i' },
    });
    return count > 0;
  }

  async findAll({ filter = {}, page = 1, limit = 20, sort = { skillName: 1 } } = {}) {
    const skip = (page - 1) * limit;
    const [items, totalItems] = await Promise.all([
      SkillTaxonomy.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      SkillTaxonomy.countDocuments(filter),
    ]);
    return { items, totalItems };
  }

  async countReferencesInCareerPaths(skillId) {
    const CareerPath = mongoose.model('CareerPath');
    return CareerPath.countDocuments({
      'requiredSkills.skillId': skillId,
      isActive: true,
    });
  }

  async updateById(id, updateData) {
    const skill = await SkillTaxonomy.findById(id);
    if (!skill) return null;
    Object.assign(skill, updateData);
    return skill.save();
  }

  async deactivateById(id) {
    return SkillTaxonomy.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
  }
}

// mongoose is referenced lazily inside countReferencesInCareerPaths to
// avoid a require-order circular dependency between the two sibling
// modules (skill-taxonomy <-> career-path) at module-load time.
const mongoose = require('mongoose');

module.exports = new SkillTaxonomyRepository();