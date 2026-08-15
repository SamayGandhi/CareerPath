/**
 * course.repository.js
 * -----------------------------------------
 * Data-access layer for the Course model.
 * UPDATED (Phase 17): added syncRating(), called by the Review module
 * whenever a course review is created/updated/deleted, keeping the
 * denormalized rating/ratingCount fields (used throughout the
 * Recommendation Engine's courseRelevance rule) accurate.
 */

const Course = require('./course.model');

class CourseRepository {
  async create(data) {
    return Course.create(data);
  }

  async findById(id) {
    return Course.findById(id)
      .populate('platformId', 'name slug logoUrl averageRating pricingModel')
      .populate('skillsCovered', 'skillName slug category')
      .exec();
  }

  async findBySlug(slug) {
    return Course.findOne({ slug, isActive: true })
      .populate('platformId', 'name slug logoUrl averageRating pricingModel')
      .populate('skillsCovered', 'skillName slug category')
      .exec();
  }

  async findByIds(ids) {
    return Course.find({ _id: { $in: ids }, isActive: true })
      .populate('platformId', 'name slug logoUrl')
      .exec();
  }

  async existsBySlug(slug) {
    const count = await Course.countDocuments({ slug });
    return count > 0;
  }

  async findBySkillId(skillId, { page = 1, limit = 20 } = {}) {
    const filter = { skillsCovered: skillId, isActive: true };
    const skip = (page - 1) * limit;

    const [items, totalItems] = await Promise.all([
      Course.find(filter)
        .sort({ rating: -1 })
        .skip(skip)
        .limit(limit)
        .populate('platformId', 'name slug logoUrl')
        .exec(),
      Course.countDocuments(filter),
    ]);

    return { items, totalItems };
  }

  async findBySkillIds(skillIds) {
    return Course.find({ skillsCovered: { $in: skillIds }, isActive: true })
      .populate('platformId', 'name slug logoUrl averageRating pricingModel')
      .populate('skillsCovered', 'skillName slug')
      .exec();
  }

  async findAll({ filter = {}, page = 1, limit = 20, sort = { createdAt: -1 } } = {}) {
    const skip = (page - 1) * limit;
    const [items, totalItems] = await Promise.all([
      Course.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('platformId', 'name slug logoUrl')
        .exec(),
      Course.countDocuments(filter),
    ]);
    return { items, totalItems };
  }

  async searchByText(query, { page = 1, limit = 20 } = {}) {
    const filter = { $text: { $search: query }, isActive: true };
    const skip = (page - 1) * limit;

    const [items, totalItems] = await Promise.all([
      Course.find(filter, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit)
        .populate('platformId', 'name slug logoUrl')
        .exec(),
      Course.countDocuments(filter),
    ]);

    return { items, totalItems };
  }

  async updateById(id, updateData) {
    const course = await Course.findById(id);
    if (!course) return null;
    Object.assign(course, updateData);
    return course.save();
  }

  async deactivateById(id) {
    return Course.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
  }

  /**
   * Directly writes an aggregated rating/count onto the course document
   * without going through the full validation pipeline unnecessarily —
   * this is a denormalized cache field, not user-facing editable data.
   */
  async syncRating(courseId, { averageRating, count }) {
    return Course.findByIdAndUpdate(
      courseId,
      { rating: Math.round(averageRating * 10) / 10, ratingCount: count },
      { new: true }
    ).exec();
  }
}

module.exports = new CourseRepository();