/**
 * recommendation.service.js
 * -----------------------------------------
 * Business orchestration for the Recommendation Engine.
 * UPDATED (Batch 5.4): generate() now triggers a real
 * "recommendationReady" notification after the recommendation (and
 * its optional AI explanation attempt) is fully persisted. All prior
 * logic (rule-based scoring, Strategy Pattern, AI enhancement wiring)
 * is unchanged.
 */

const ApiError = require('../../shared/errors/ApiError');
const recommendationRepository = require('./recommendation.repository');
const skillGapReportRepository = require('../skill-gap-engine/skillGapReport.repository');
const profileRepository = require('../profile/profile.repository');
const careerPathRepository = require('../career-path/careerPath.repository');
const courseRepository = require('../course/course.repository');
const recommendationRuleEngine = require('./engine/recommendation.ruleEngine');
const aiGateway = require('../../ai/ai.gateway');
const notificationService = require('../notification/notification.service');
const logger = require('../../config/logger.config');
const { PAGINATION_DEFAULTS } = require('../../config/constants');

const MAX_RECOMMENDED_COURSES = 10;

const STRATEGY_DISPLAY_LABELS = {
  schoolStudentStrategy: 'School Student',
  collegeStudentStrategy: 'College Student',
  fresherStrategy: 'Fresher',
  workingProfessionalStrategy: 'Working Professional',
  careerSwitcherStrategy: 'Career Switcher',
  selfLearnerStrategy: 'Self Learner',
};

class RecommendationService {
  async generate(userId, skillGapReportId) {
    const skillGapReport = await skillGapReportRepository.findById(skillGapReportId);
    if (!skillGapReport) {
      throw ApiError.notFound('Skill gap report not found', 'SKILL_GAP_REPORT_NOT_FOUND');
    }
    if (skillGapReport.userId.toString() !== userId) {
      throw ApiError.forbidden('This skill gap report does not belong to you', 'FORBIDDEN');
    }

    const profile = await profileRepository.findByUserId(userId);
    if (!profile) {
      throw ApiError.notFound('Profile not found', 'PROFILE_NOT_FOUND');
    }

    if (profile.skillsVersion !== skillGapReport.profileSnapshotVersion) {
      throw ApiError.unprocessable(
        'Your profile has changed since this skill gap report was generated. Please re-run the skill gap analysis for accurate recommendations.',
        'REPORT_STALE'
      );
    }

    const careerPath = await careerPathRepository.findById(skillGapReport.targetCareerPathId);
    if (!careerPath) {
      throw ApiError.notFound('Career path not found', 'CAREER_PATH_NOT_FOUND');
    }

    const careerPathSkillWeights = new Map(
      careerPath.requiredSkills.map((rs) => [rs.skillId.toString(), rs.weight])
    );

    const gapSkillIds = skillGapReport.gaps
      .filter((g) => g.gapSeverity !== 'none')
      .map((g) => g.skillId);

    if (gapSkillIds.length === 0) {
      throw ApiError.unprocessable(
        'No skill gaps were found in this report, so there is nothing to recommend courses for.',
        'NO_GAPS_TO_ADDRESS'
      );
    }

    const candidateCourses = await courseRepository.findBySkillIds(gapSkillIds);

    if (candidateCourses.length === 0) {
      throw ApiError.notFound(
        'No courses currently cover the skills in your gap report. Please check back later as our catalog grows.',
        'NO_CANDIDATE_COURSES'
      );
    }

    const { strategyUsed, recommendedCourses } = recommendationRuleEngine.generateRecommendations({
      candidateCourses,
      gaps: skillGapReport.gaps,
      careerPathSkillWeights,
      userType: profile.userType || 'selfLearner',
      budgetPreference: profile.budgetPreference,
      weeklyTimeCommitmentHours: profile.weeklyTimeCommitmentHours,
      targetCareerPathId: careerPath._id,
      topN: MAX_RECOMMENDED_COURSES,
    });

    const recommendedPlatforms = this._derivePlatformRecommendations(
      recommendedCourses,
      candidateCourses
    );

    const recommendation = await recommendationRepository.create({
      userId,
      skillGapReportId,
      strategyUsed,
      recommendedCourses,
      recommendedPlatforms,
      aiEnhancedExplanation: null,
      aiEnhancementStatus: 'notAttempted',
      generatedAt: new Date(),
    });

    const populated = await recommendationRepository.findById(recommendation._id);
    await this._attemptAiExplanation(populated);

    await notificationService.notifyUser({
      userId,
      type: 'recommendationReady',
      title: 'New recommendations ready',
      message: `We found ${recommendedCourses.length} course${recommendedCourses.length === 1 ? '' : 's'} matched to your latest skill gap analysis.`,
      relatedEntityType: 'recommendation',
      relatedEntityId: recommendation._id,
    });

    return recommendationRepository.findById(recommendation._id);
  }

  async getLatest(userId) {
    const recommendation = await recommendationRepository.findLatestByUser(userId);
    if (!recommendation) {
      throw ApiError.notFound(
        'No recommendations found. Please generate one first.',
        'NO_RECOMMENDATION_FOUND'
      );
    }
    return recommendation;
  }

  async getHistory(userId, query) {
    const { page, limit } = query;
    const { items, totalItems } = await recommendationRepository.findHistoryByUser(userId, {
      page: page || PAGINATION_DEFAULTS.DEFAULT_PAGE,
      limit: limit || PAGINATION_DEFAULTS.DEFAULT_LIMIT,
    });

    return { items, pagination: this._buildPagination(page, limit, totalItems) };
  }

  async getById(id, requestingUser) {
    const recommendation = await recommendationRepository.findById(id);
    if (!recommendation) {
      throw ApiError.notFound('Recommendation not found', 'RECOMMENDATION_NOT_FOUND');
    }

    const isOwner = recommendation.userId.toString() === requestingUser.id;
    const isAdmin = requestingUser.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw ApiError.forbidden('You do not have access to this recommendation', 'FORBIDDEN');
    }

    return recommendation;
  }

  async regenerateExplanation(id, requestingUser) {
    const recommendation = await this.getById(id, requestingUser);

    const attempted = await this._attemptAiExplanation(recommendation);

    if (!attempted.attempted) {
      throw ApiError.serviceUnavailable(
        'AI enhancement is currently unavailable. Your rule-based recommendation and its reasons remain fully valid.',
        'AI_SERVICE_UNAVAILABLE'
      );
    }

    if (!attempted.success) {
      throw ApiError.serviceUnavailable(
        'The AI service could not generate an explanation right now. Your rule-based recommendation and its reasons remain fully valid.',
        'AI_GENERATION_FAILED'
      );
    }

    return recommendationRepository.findById(id);
  }

  async _attemptAiExplanation(recommendation) {
    try {
      const strategyLabel =
        STRATEGY_DISPLAY_LABELS[recommendation.strategyUsed] || recommendation.strategyUsed;

      const result = await aiGateway.explainRecommendation({
        strategyLabel,
        courses: recommendation.recommendedCourses.slice(0, 5).map((rc) => ({
          title: rc.courseId?.title || 'Course',
          score: rc.score,
          reasons: rc.reasons || [],
        })),
      });

      if (result.success) {
        await recommendationRepository.updateAiExplanation(recommendation._id, {
          aiEnhancedExplanation: result.explanation,
          aiEnhancementStatus: 'success',
        });
      } else if (result.attempted) {
        await recommendationRepository.updateAiExplanation(recommendation._id, {
          aiEnhancedExplanation: null,
          aiEnhancementStatus: 'failedFallbackUsed',
        });
      }

      return result;
    } catch (error) {
      logger.error(`Unexpected error during AI recommendation explanation attempt: ${error.message}`);
      return { attempted: false, success: false, reason: 'unexpected_error' };
    }
  }

  _derivePlatformRecommendations(recommendedCourses, candidateCourses) {
    const courseMap = new Map(candidateCourses.map((c) => [c._id.toString(), c]));
    const platformScores = new Map();

    for (const rec of recommendedCourses) {
      const course = courseMap.get(rec.courseId.toString());
      if (!course || !course.platformId) continue;

      const platformId = course.platformId._id.toString();
      const existing = platformScores.get(platformId) || { totalScore: 0, count: 0 };
      existing.totalScore += rec.score;
      existing.count += 1;
      platformScores.set(platformId, existing);
    }

    return Array.from(platformScores.entries())
      .map(([platformId, { totalScore, count }]) => ({
        platformId,
        score: Math.round(totalScore / count),
        reasons: [`${count} recommended course${count > 1 ? 's' : ''} available on this platform`],
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  _buildPagination(page, limit, totalItems) {
    return { page, limit, totalPages: Math.ceil(totalItems / limit), totalItems };
  }
}

module.exports = new RecommendationService();