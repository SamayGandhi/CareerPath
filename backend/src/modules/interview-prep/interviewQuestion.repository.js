/**
 * interviewQuestion.repository.js
 * -----------------------------------------
 * Data-access layer for the InterviewQuestion model.
 */

const InterviewQuestion = require('./interviewQuestion.model');

class InterviewQuestionRepository {
  async create(data) {
    return InterviewQuestion.create(data);
  }

  async findById(id) {
    return InterviewQuestion.findById(id).exec();
  }

  async findByIdWithAnswer(id) {
    return InterviewQuestion.findById(id).select('+correctAnswer').exec();
  }

  async findByIdsWithAnswers(ids) {
    return InterviewQuestion.find({ _id: { $in: ids } }).select('+correctAnswer').exec();
  }

  /**
   * Public-facing browsing query (no correctAnswer exposed).
   */
  async findForPractice({ careerPathId, skillId, difficulty, questionType, limit = 20 } = {}) {
    const filter = { isActive: true };
    if (careerPathId) filter.relatedCareerPathIds = careerPathId;
    if (skillId) filter.relatedSkillIds = skillId;
    if (difficulty) filter.difficultyLevel = difficulty;
    if (questionType) filter.questionType = questionType;

    return InterviewQuestion.find(filter).limit(limit).exec();
  }

  /**
   * Randomized selection for mock test generation. Uses MongoDB's
   * $sample aggregation for a deterministic, unbiased random draw —
   * not AI, just a standard DB-level random sampling operator.
   */
  async findRandomForMockTest({ careerPathId, difficulty, questionCount }) {
    const matchStage = { isActive: true };
    if (careerPathId) matchStage.relatedCareerPathIds = careerPathId;
    if (difficulty) matchStage.difficultyLevel = difficulty;

    return InterviewQuestion.aggregate([
      { $match: matchStage },
      { $sample: { size: questionCount } },
    ]);
  }

  async updateById(id, updateData) {
    const question = await InterviewQuestion.findById(id);
    if (!question) return null;
    Object.assign(question, updateData);
    return question.save();
  }

  async deactivateById(id) {
    return InterviewQuestion.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
  }

  async findAll({ filter = {}, page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [items, totalItems] = await Promise.all([
      InterviewQuestion.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      InterviewQuestion.countDocuments(filter),
    ]);
    return { items, totalItems };
  }
}

module.exports = new InterviewQuestionRepository();