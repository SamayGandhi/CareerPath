/**
 * assessment.repository.js
 * -----------------------------------------
 * Data-access layer for the Assessment model.
 */

const Assessment = require('./assessment.model');

class AssessmentRepository {
  async create(data) {
    return Assessment.create(data);
  }

  async findById(id) {
    return Assessment.findById(id)
      .populate('derivedSkills.skillId', 'skillName slug category')
      .exec();
  }

  async findLatestByUserId(userId) {
    return Assessment.findOne({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findAllByUserId(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [items, totalItems] = await Promise.all([
      Assessment.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      Assessment.countDocuments({ userId }),
    ]);
    return { items, totalItems };
  }
}

module.exports = new AssessmentRepository();