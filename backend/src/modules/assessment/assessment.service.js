/**
 * assessment.service.js
 * -----------------------------------------
 * Business logic for the Skill Assessment module.
 * UPDATED (Batch 5.4): submitAssessment() now triggers a real
 * "assessmentCompleted" notification after the skills are merged into
 * the profile, following the exact same direct-call pattern already
 * established by roadmap.service.js's stage-completion notifications.
 * All prior logic (question selection from Batch 5.1, deterministic
 * proficiency derivation) is unchanged.
 */

const ApiError = require('../../shared/errors/ApiError');
const assessmentRepository = require('./assessment.repository');
const assessmentQuestionRepository = require('./assessmentQuestion.repository');
const careerPathRepository = require('../career-path/careerPath.repository');
const profileService = require('../profile/profile.service');
const notificationService = require('../notification/notification.service');
const { PAGINATION_DEFAULTS } = require('../../config/constants');

const DIFFICULTY_ORDER = ['beginner', 'intermediate', 'advanced'];

class AssessmentService {
  async getQuestions(query) {
    const { type, careerPathId, limit } = query;

    if (!careerPathId && !limit) {
      return this._getLegacyOrderedQuestions(type);
    }

    let skillIds;
    if (careerPathId) {
      const careerPath = await careerPathRepository.findById(careerPathId);
      if (!careerPath || !careerPath.isActive) {
        throw ApiError.notFound('Career path not found', 'CAREER_PATH_NOT_FOUND');
      }
      skillIds = careerPath.requiredSkills.map((rs) => rs.skillId);
    }

    const candidates = await assessmentQuestionRepository.findCandidatesForAssessment({
      assessmentType: type,
      skillIds,
    });

    if (candidates.length === 0) {
      throw ApiError.notFound(
        careerPathId
          ? 'No assessment questions are configured for the skills required by this career path yet.'
          : `No assessment questions configured for type: ${type}`,
        'NO_QUESTIONS_FOUND'
      );
    }

    const selectionLimit = limit || candidates.length;
    return this._selectDifficultyBalancedRandom(candidates, selectionLimit);
  }

  async _getLegacyOrderedQuestions(assessmentType) {
    const questions = await assessmentQuestionRepository.findByType(assessmentType);
    if (questions.length === 0) {
      throw ApiError.notFound(
        `No assessment questions configured for type: ${assessmentType}`,
        'NO_QUESTIONS_FOUND'
      );
    }
    return questions;
  }

  _selectDifficultyBalancedRandom(candidates, limit) {
    const buckets = { beginner: [], intermediate: [], advanced: [] };

    for (const question of candidates) {
      const level = DIFFICULTY_ORDER.includes(question.skillId?.difficultyLevel)
        ? question.skillId.difficultyLevel
        : 'beginner';
      buckets[level].push(question);
    }

    for (const level of DIFFICULTY_ORDER) {
      buckets[level] = this._shuffle(buckets[level]);
    }

    const pointers = { beginner: 0, intermediate: 0, advanced: 0 };
    const selected = [];
    let cursor = 0;

    while (selected.length < limit) {
      const level = DIFFICULTY_ORDER[cursor % DIFFICULTY_ORDER.length];
      if (pointers[level] < buckets[level].length) {
        selected.push(buckets[level][pointers[level]]);
        pointers[level] += 1;
      }
      cursor += 1;

      const anyRemaining = DIFFICULTY_ORDER.some((lvl) => pointers[lvl] < buckets[lvl].length);
      if (!anyRemaining) break;
    }

    return this._shuffle(selected);
  }

  _shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  async submitAssessment(userId, { assessmentType, responses }) {
    const questionIds = responses.map((r) => r.questionId);
    const questions = await assessmentQuestionRepository.findByIds(questionIds);

    if (questions.length !== questionIds.length) {
      throw ApiError.badRequest(
        'One or more submitted questions do not exist or are inactive',
        'INVALID_QUESTION_REFERENCE'
      );
    }

    const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

    const enrichedResponses = [];
    const skillProficiencyAccumulator = new Map();

    for (const response of responses) {
      const question = questionMap.get(response.questionId);

      const proficiency = this._deriveProficiency(question, response.answer);

      enrichedResponses.push({
        questionId: question._id.toString(),
        questionText: question.questionText,
        answer: response.answer,
        skillId: question.skillId,
      });

      const skillKey = question.skillId.toString();
      if (!skillProficiencyAccumulator.has(skillKey)) {
        skillProficiencyAccumulator.set(skillKey, []);
      }
      skillProficiencyAccumulator.get(skillKey).push(proficiency);
    }

    const derivedSkills = Array.from(skillProficiencyAccumulator.entries()).map(
      ([skillId, proficiencies]) => ({
        skillId,
        proficiency: Math.round(
          proficiencies.reduce((sum, p) => sum + p, 0) / proficiencies.length
        ),
      })
    );

    const assessment = await assessmentRepository.create({
      userId,
      assessmentType,
      responses: enrichedResponses,
      derivedSkills,
      completedAt: new Date(),
    });

    await profileService.mergeAssessedSkills(userId, derivedSkills, assessment._id);

    await notificationService.notifyUser({
      userId,
      type: 'assessmentCompleted',
      title: 'Assessment completed',
      message: `You updated ${derivedSkills.length} skill${derivedSkills.length === 1 ? '' : 's'} in your profile.`,
      relatedEntityType: 'assessment',
      relatedEntityId: assessment._id,
    });

    return { assessment, derivedSkills };
  }

  async getHistory(userId, query) {
    const { page, limit } = query;
    const { items, totalItems } = await assessmentRepository.findAllByUserId(userId, {
      page: page || PAGINATION_DEFAULTS.DEFAULT_PAGE,
      limit: limit || PAGINATION_DEFAULTS.DEFAULT_LIMIT,
    });

    return {
      items,
      pagination: this._buildPagination(page, limit, totalItems),
    };
  }

  async getById(assessmentId, requestingUser) {
    const assessment = await assessmentRepository.findById(assessmentId);
    if (!assessment) {
      throw ApiError.notFound('Assessment not found', 'ASSESSMENT_NOT_FOUND');
    }

    const isOwner = assessment.userId.toString() === requestingUser.id;
    const isAdmin = requestingUser.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw ApiError.forbidden('You do not have access to this assessment', 'FORBIDDEN');
    }

    return assessment;
  }

  _deriveProficiency(question, answer) {
    switch (question.questionType) {
      case 'proficiencySlider': {
        const numericAnswer = Number(answer);
        if (Number.isNaN(numericAnswer) || numericAnswer < 1 || numericAnswer > 5) {
          throw ApiError.badRequest(
            `Invalid slider answer for question "${question.questionText}". Must be 1-5.`,
            'INVALID_ANSWER_VALUE'
          );
        }
        return numericAnswer;
      }

      case 'proficiencySelect': {
        const matchedOption = question.options.find(
          (opt) => opt.label === answer || opt.proficiencyValue === Number(answer)
        );
        if (!matchedOption) {
          throw ApiError.badRequest(
            `Invalid option selected for question "${question.questionText}"`,
            'INVALID_ANSWER_VALUE'
          );
        }
        return matchedOption.proficiencyValue;
      }

      case 'yesNo': {
        const isYes = answer === true || answer === 'yes' || answer === 1 || answer === '1';
        return isYes ? 3 : 1;
      }

      default:
        throw ApiError.internal(`Unsupported question type: ${question.questionType}`);
    }
  }

  _buildPagination(page, limit, totalItems) {
    return {
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
    };
  }
}

module.exports = new AssessmentService();