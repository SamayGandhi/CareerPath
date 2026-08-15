/**
 * roadmap.repository.js
 * -----------------------------------------
 * Data-access layer for the Roadmap model.
 */

const Roadmap = require('./roadmap.model');

class RoadmapRepository {
  async create(data) {
    return Roadmap.create(data);
  }

  async findById(id) {
    return Roadmap.findById(id)
      .populate('careerPathId', 'title slug')
      .populate('stages.linkedCourseIds', 'title slug externalUrl price level')
      .populate('stages.linkedSkillIds', 'skillName slug')
      .exec();
  }

  async findActiveByUser(userId) {
    return Roadmap.findOne({ userId, isActive: true })
      .populate('careerPathId', 'title slug')
      .populate('stages.linkedCourseIds', 'title slug externalUrl price level')
      .populate('stages.linkedSkillIds', 'skillName slug')
      .exec();
  }

  async findAllByUser(userId, { page = 1, limit = 20, status } = {}) {
    const filter = { userId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [items, totalItems] = await Promise.all([
      Roadmap.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('careerPathId', 'title slug')
        .exec(),
      Roadmap.countDocuments(filter),
    ]);

    return { items, totalItems };
  }

  async deactivateAllForUser(userId) {
    return Roadmap.updateMany({ userId, isActive: true }, { isActive: false }).exec();
  }

  async save(roadmapDocument) {
    return roadmapDocument.save();
  }

  async findRawById(id) {
    // Unpopulated — used internally when we need to mutate and save
    return Roadmap.findById(id).exec();
  }
}

module.exports = new RoadmapRepository();