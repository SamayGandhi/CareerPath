/**
 * assessmentQuestion.repository.js
 * -----------------------------------------
 * Data-access layer for the AssessmentQuestion model.
 * UPDATED (Batch 5.1 — smarter assessment): added
 * findCandidatesForAssessment(), which optionally filters by a set of
 * skillIds (used for career-specific question selection) and always
 * populates the linked skill's `difficultyLevel` — this is what makes
 * difficulty-balanced selection possible without adding any new field
 * to this model. findByType() is UNCHANGED and still used verbatim by
 * the legacy/backward-compatible code path in assessment.service.js.
 */

const AssessmentQuestion = require('./assessmentQuestion.model');

class AssessmentQuestionRepository {
  async findByType(assessmentType) {
    return AssessmentQuestion.find({ assessmentType, isActive: true })
      .sort({ order: 1 })
      .populate('skillId', 'skillName slug category')
      .exec();
  }

  /**
   * Fetches all active candidate questions for a type, optionally
   * restricted to a set of skillIds. Populates the skill's
   * difficultyLevel so the service layer can bucket/balance selection
   * by difficulty using data that already exists on SkillTaxonomy —
   * no new field required on this model.
   */
  async findCandidatesForAssessment({ assessmentType, skillIds } = {}) {
    const filter = { assessmentType, isActive: true };
    if (skillIds && skillIds.length > 0) {
      filter.skillId = { $in: skillIds };
    }

    return AssessmentQuestion.find(filter)
      .populate('skillId', 'skillName slug category difficultyLevel')
      .exec();
  }

  async findByIds(ids) {
    return AssessmentQuestion.find({ _id: { $in: ids } }).exec();
  }

  async findById(id) {
    return AssessmentQuestion.findById(id).exec();
  }
}

module.exports = new AssessmentQuestionRepository();