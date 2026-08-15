/**
 * review.repository.js
 * -----------------------------------------
 * Data-access layer for the Review model.
 */

const Review = require('./review.model');

class ReviewRepository {
  async create(data) {
    return Review.create(data);
  }

  async findById(id) {
    return Review.findById(id).populate('userId', 'fullName').exec();
  }

  async findRawById(id) {
    return Review.findById(id).exec();
  }

  async findExistingByUserAndTarget(userId, targetType, targetId) {
    return Review.findOne({ userId, targetType, targetId }).exec();
  }

  async findByTarget(targetType, targetId, { page = 1, limit = 20, sortBy = 'createdAt' } = {}) {
    const sortMap = {
      createdAt: { createdAt: -1 },
      rating: { rating: -1 },
    };
    const sort = sortMap[sortBy] || sortMap.createdAt;

    const skip = (page - 1) * limit;
    const [items, totalItems] = await Promise.all([
      Review.find({ targetType, targetId })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('userId', 'fullName')
        .exec(),
      Review.countDocuments({ targetType, targetId }),
    ]);

    return { items, totalItems };
  }

  /**
   * Aggregates the average rating and count for a target — used to
   * sync Course.rating/ratingCount and Platform.averageRating whenever
   * a review is created, updated, or deleted.
   */
  async getAggregateRating(targetType, targetId) {
    const result = await Review.aggregate([
      { $match: { targetType, targetId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (result.length === 0) return { averageRating: 0, count: 0 };
    return { averageRating: result[0].averageRating, count: result[0].count };
  }

  async updateById(id, updateData) {
    const review = await Review.findById(id);
    if (!review) return null;
    Object.assign(review, updateData);
    return review.save();
  }

  async deleteById(id) {
    return Review.findByIdAndDelete(id).exec();
  }
}

module.exports = new ReviewRepository();