/**
 * progress.repository.js
 * -----------------------------------------
 * Data-access layer for the Progress model.
 */

const Progress = require('./progress.model');

class ProgressRepository {
  async create(data) {
    return Progress.create(data);
  }

  async findById(id) {
    return Progress.findById(id).populate('courseId', 'title slug externalUrl').exec();
  }

  async findOneByUserAndCourse(userId, courseId) {
    return Progress.findOne({ userId, courseId }).exec();
  }

  async findRawById(id) {
    return Progress.findById(id).exec();
  }

  async findAllByUser(userId, { roadmapId, status, page = 1, limit = 20 } = {}) {
    const filter = { userId };
    if (roadmapId) filter.roadmapId = roadmapId;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [items, totalItems] = await Promise.all([
      Progress.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('courseId', 'title slug externalUrl')
        .exec(),
      Progress.countDocuments(filter),
    ]);

    return { items, totalItems };
  }

  async findAllByRoadmap(userId, roadmapId) {
    return Progress.find({ userId, roadmapId }).exec();
  }

  async save(progressDocument) {
    return progressDocument.save();
  }
}

module.exports = new ProgressRepository();