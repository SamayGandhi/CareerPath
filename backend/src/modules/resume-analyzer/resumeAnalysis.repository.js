/**
 * resumeAnalysis.repository.js
 * -----------------------------------------
 * Data-access layer for the ResumeAnalysis model.
 * UPDATED (AI Enhancement Module): added updateAiSuggestions().
 */

const ResumeAnalysis = require('./resumeAnalysis.model');

class ResumeAnalysisRepository {
  async create(data) {
    return ResumeAnalysis.create(data);
  }

  async findById(id) {
    return ResumeAnalysis.findById(id)
      .populate('extractedSkills.skillId', 'skillName slug category')
      .populate('missingSkillsForTarget', 'skillName slug category')
      .populate('targetCareerPathId', 'title slug')
      .exec();
  }

  async findAllByUser(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [items, totalItems] = await Promise.all([
      ResumeAnalysis.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      ResumeAnalysis.countDocuments({ userId }),
    ]);
    return { items, totalItems };
  }

  async updateAiSuggestions(id, { aiSuggestions, aiEnhancementStatus }) {
    return ResumeAnalysis.findByIdAndUpdate(
      id,
      { aiSuggestions, aiEnhancementStatus },
      { new: true }
    ).exec();
  }
}

module.exports = new ResumeAnalysisRepository();