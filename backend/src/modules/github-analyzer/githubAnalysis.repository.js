/**
 * githubAnalysis.repository.js
 * -----------------------------------------
 * Data-access layer for the GithubAnalysis model.
 * UPDATED (AI Enhancement Module): added updateAiSummary().
 */

const GithubAnalysis = require('./githubAnalysis.model');

class GithubAnalysisRepository {
  async create(data) {
    return GithubAnalysis.create(data);
  }

  async findById(id) {
    return GithubAnalysis.findById(id)
      .populate('inferredSkills.skillId', 'skillName slug category')
      .exec();
  }

  async findAllByUser(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [items, totalItems] = await Promise.all([
      GithubAnalysis.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      GithubAnalysis.countDocuments({ userId }),
    ]);
    return { items, totalItems };
  }

  async updateAiSummary(id, { aiSummary, aiEnhancementStatus }) {
    return GithubAnalysis.findByIdAndUpdate(
      id,
      { aiSummary, aiEnhancementStatus },
      { new: true }
    ).exec();
  }
}

module.exports = new GithubAnalysisRepository();