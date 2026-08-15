/**
 * interviewAttempt.repository.js
 * -----------------------------------------
 * Data-access layer for the InterviewAttempt model.
 */

const InterviewAttempt = require('./interviewAttempt.model');

class InterviewAttemptRepository {
  async create(data) {
    return InterviewAttempt.create(data);
  }

  async findRawById(id) {
    return InterviewAttempt.findById(id).exec();
  }

  async findById(id) {
    return InterviewAttempt.findById(id)
      .populate('questionsAttempted.questionId', 'questionText questionType options explanation')
      .populate('careerPathId', 'title slug')
      .exec();
  }

  async findAllByUser(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [items, totalItems] = await Promise.all([
      InterviewAttempt.find({ userId, status: 'submitted' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('careerPathId', 'title slug')
        .exec(),
      InterviewAttempt.countDocuments({ userId, status: 'submitted' }),
    ]);
    return { items, totalItems };
  }

  async findRecentSubmittedByUserAndCareerPath(userId, careerPathId, limit = 10) {
    const filter = { userId, status: 'submitted' };
    if (careerPathId) filter.careerPathId = careerPathId;

    return InterviewAttempt.find(filter).sort({ createdAt: -1 }).limit(limit).exec();
  }

  async save(attemptDocument) {
    return attemptDocument.save();
  }
}

module.exports = new InterviewAttemptRepository();