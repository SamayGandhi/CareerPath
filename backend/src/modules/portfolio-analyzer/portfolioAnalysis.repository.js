/**
 * portfolioAnalysis.repository.js
 * -----------------------------------------
 * Data-access layer for the PortfolioAnalysis model.
 * UPDATED (AI Enhancement Module): added updateAiFeedback().
 */

const PortfolioAnalysis = require('./portfolioAnalysis.model');

class PortfolioAnalysisRepository {
  async create(data) {
    return PortfolioAnalysis.create(data);
  }

  async findById(id) {
    return PortfolioAnalysis.findById(id).exec();
  }

  async findAllByUser(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [items, totalItems] = await Promise.all([
      PortfolioAnalysis.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      PortfolioAnalysis.countDocuments({ userId }),
    ]);
    return { items, totalItems };
  }

  async updateAiFeedback(id, { aiFeedback, aiEnhancementStatus }) {
    return PortfolioAnalysis.findByIdAndUpdate(
      id,
      { aiFeedback, aiEnhancementStatus },
      { new: true }
    ).exec();
  }
}

module.exports = new PortfolioAnalysisRepository();