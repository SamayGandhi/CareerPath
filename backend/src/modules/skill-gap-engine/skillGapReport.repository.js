/**
 * skillGapReport.repository.js
 * -----------------------------------------
 * Data-access layer for the SkillGapReport model.
 * UPDATED (AI Enhancement Module): added updateAiExplanation(), the
 * write path used after an AI enhancement attempt completes (success
 * or honest failure), matching the pattern in recommendation.repository.js.
 */

const SkillGapReport = require('./skillGapReport.model');

class SkillGapReportRepository {
  async create(data) {
    return SkillGapReport.create(data);
  }

  async findById(id) {
    return SkillGapReport.findById(id)
      .populate('targetCareerPathId', 'title slug')
      .populate('gaps.skillId', 'skillName slug category difficultyLevel')
      .populate('gaps.missingPrerequisites', 'skillName slug')
      .exec();
  }

  async findLatestByUserAndCareerPath(userId, targetCareerPathId) {
    return SkillGapReport.findOne({ userId, targetCareerPathId })
      .sort({ createdAt: -1 })
      .populate('targetCareerPathId', 'title slug')
      .populate('gaps.skillId', 'skillName slug category difficultyLevel')
      .populate('gaps.missingPrerequisites', 'skillName slug')
      .exec();
  }

  async findLatestByUser(userId) {
    return SkillGapReport.findOne({ userId })
      .sort({ createdAt: -1 })
      .populate('targetCareerPathId', 'title slug')
      .populate('gaps.skillId', 'skillName slug category difficultyLevel')
      .exec();
  }

  async findHistoryByUser(userId, { page = 1, limit = 20, targetCareerPathId } = {}) {
    const filter = { userId };
    if (targetCareerPathId) filter.targetCareerPathId = targetCareerPathId;

    const skip = (page - 1) * limit;
    const [items, totalItems] = await Promise.all([
      SkillGapReport.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('targetCareerPathId', 'title slug')
        .exec(),
      SkillGapReport.countDocuments(filter),
    ]);

    return { items, totalItems };
  }

  async updateAiExplanation(id, { aiEnhancedExplanation, aiEnhancementStatus }) {
    return SkillGapReport.findByIdAndUpdate(
      id,
      { aiEnhancedExplanation, aiEnhancementStatus },
      { new: true }
    ).exec();
  }
}

module.exports = new SkillGapReportRepository();