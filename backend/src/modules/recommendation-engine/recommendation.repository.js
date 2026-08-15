/**
 * recommendation.repository.js
 * -----------------------------------------
 * Data-access layer for the Recommendation model.
 * UPDATED (Phase 8): recommendedCourses.courseId population now
 * includes `skillsCovered`, needed by the Roadmap Engine's builder to
 * map courses to the correct roadmap stage.
 */

const Recommendation = require('./recommendation.model');

class RecommendationRepository {
  async create(data) {
    return Recommendation.create(data);
  }

  async findById(id) {
    return Recommendation.findById(id)
      .populate({
        path: 'recommendedCourses.courseId',
        select: 'title slug platformId price level rating durationHours externalUrl skillsCovered',
        populate: { path: 'platformId', select: 'name slug logoUrl' },
      })
      .populate('recommendedPlatforms.platformId', 'name slug logoUrl pricingModel')
      .exec();
  }

  async findLatestByUser(userId) {
    return Recommendation.findOne({ userId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'recommendedCourses.courseId',
        select: 'title slug platformId price level rating durationHours externalUrl skillsCovered',
        populate: { path: 'platformId', select: 'name slug logoUrl' },
      })
      .populate('recommendedPlatforms.platformId', 'name slug logoUrl pricingModel')
      .exec();
  }

  async findHistoryByUser(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [items, totalItems] = await Promise.all([
      Recommendation.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      Recommendation.countDocuments({ userId }),
    ]);
    return { items, totalItems };
  }

  async updateAiExplanation(id, { aiEnhancedExplanation, aiEnhancementStatus }) {
    return Recommendation.findByIdAndUpdate(
      id,
      { aiEnhancedExplanation, aiEnhancementStatus },
      { new: true }
    ).exec();
  }
}

module.exports = new RecommendationRepository();