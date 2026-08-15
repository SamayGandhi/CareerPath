/**
 * skillGap.service.js
 * -----------------------------------------
 * Business orchestration for the Skill Gap Engine.
 * UPDATED (AI Enhancement Module): analyze() now attempts an optional
 * AI-generated explanation AFTER the rule-based report is already
 * fully computed and persisted. The AI call is wrapped so its outcome
 * can NEVER change the report's core data or cause analyze() to fail —
 * it can only add or fail to add the `aiEnhancedExplanation` field.
 * This is the exact "AI enhances, never replaces" contract required.
 */

const ApiError = require('../../shared/errors/ApiError');
const skillGapReportRepository = require('./skillGapReport.repository');
const profileRepository = require('../profile/profile.repository');
const careerPathRepository = require('../career-path/careerPath.repository');
const skillTaxonomyRepository = require('../skill-taxonomy/skillTaxonomy.repository');
const skillGapRulesEngine = require('./engine/skillGap.rulesEngine');
const aiGateway = require('../../ai/ai.gateway');
const logger = require('../../config/logger.config');
const { PAGINATION_DEFAULTS } = require('../../config/constants');

const MIN_REQUIRED_PROFILE_FIELDS = ['educationLevel'];

class SkillGapService {
  async analyze(userId, targetCareerPathId) {
    const profile = await profileRepository.findByUserId(userId);
    if (!profile) {
      throw ApiError.notFound(
        'Profile not found. Please complete your profile first.',
        'PROFILE_NOT_FOUND'
      );
    }

    for (const field of MIN_REQUIRED_PROFILE_FIELDS) {
      if (!profile[field]) {
        throw ApiError.unprocessable(
          'Your profile is incomplete. Please finish onboarding before running a skill gap analysis.',
          'PROFILE_INCOMPLETE'
        );
      }
    }

    const careerPath = await careerPathRepository.findById(targetCareerPathId);
    if (!careerPath || !careerPath.isActive) {
      throw ApiError.notFound('Career path not found', 'CAREER_PATH_NOT_FOUND');
    }

    const requiredSkillIds = careerPath.requiredSkills.map((rs) => rs.skillId);
    const skillTaxonomyList = await skillTaxonomyRepository.findByIds(requiredSkillIds);

    const { gaps, overallReadinessScore } = skillGapRulesEngine.analyze({
      requiredSkills: careerPath.requiredSkills,
      userSkills: profile.currentSkills,
      skillTaxonomyList,
    });

    // ---- Rule-based result is now complete and gets persisted FIRST,
    // independent of anything AI-related below. ----
    const report = await skillGapReportRepository.create({
      userId,
      targetCareerPathId,
      profileSnapshotVersion: profile.skillsVersion,
      gaps,
      overallReadinessScore,
      generatedBy: 'ruleEngine',
      aiEnhancedExplanation: null,
      aiEnhancementStatus: 'notAttempted',
    });

    // ---- Optional AI enhancement, strictly additive. Any outcome
    // here (success, honest failure, or being skipped entirely) never
    // affects the response already guaranteed by the rule-based
    // result above. ----
    await this._attemptAiExplanation(report, careerPath, skillTaxonomyList);

    return skillGapReportRepository.findById(report._id);
  }

  async getLatest(userId, careerPathId) {
    const report = careerPathId
      ? await skillGapReportRepository.findLatestByUserAndCareerPath(userId, careerPathId)
      : await skillGapReportRepository.findLatestByUser(userId);

    if (!report) {
      throw ApiError.notFound(
        'No skill gap report found. Please run an analysis first.',
        'NO_REPORT_FOUND'
      );
    }

    return report;
  }

  async getHistory(userId, query) {
    const { page, limit, careerPathId } = query;

    const { items, totalItems } = await skillGapReportRepository.findHistoryByUser(userId, {
      page: page || PAGINATION_DEFAULTS.DEFAULT_PAGE,
      limit: limit || PAGINATION_DEFAULTS.DEFAULT_LIMIT,
      targetCareerPathId: careerPathId,
    });

    return {
      items,
      pagination: this._buildPagination(page, limit, totalItems),
    };
  }

  async getById(reportId, requestingUser) {
    const report = await skillGapReportRepository.findById(reportId);
    if (!report) {
      throw ApiError.notFound('Skill gap report not found', 'REPORT_NOT_FOUND');
    }

    const isOwner = report.userId.toString() === requestingUser.id;
    const isAdmin = requestingUser.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw ApiError.forbidden('You do not have access to this report', 'FORBIDDEN');
    }

    return report;
  }

  /**
   * Best-effort AI enhancement. Wrapped in its own try/catch as a
   * final safety net on top of the gateway's own exception-free
   * contract — if literally anything unexpected happens here, it is
   * swallowed and logged, never surfaced to the caller of analyze().
   */
  async _attemptAiExplanation(report, careerPath, skillTaxonomyList) {
    try {
      const skillNameById = new Map(skillTaxonomyList.map((s) => [s._id.toString(), s.skillName]));

      const result = await aiGateway.explainSkillGap({
        careerPathTitle: careerPath.title,
        readinessScore: report.overallReadinessScore,
        gaps: report.gaps
          .filter((g) => g.gapSeverity !== 'none')
          .slice(0, 8) // cap payload size sent to the AI service
          .map((g) => ({
            skillName: skillNameById.get(g.skillId.toString()) || 'Unknown skill',
            currentLevel: g.currentLevel,
            requiredLevel: g.requiredLevel,
            gapSeverity: g.gapSeverity,
          })),
      });

      if (result.success) {
        await skillGapReportRepository.updateAiExplanation(report._id, {
          aiEnhancedExplanation: result.explanation,
          aiEnhancementStatus: 'success',
        });
      } else if (result.attempted) {
        // AI was genuinely tried and honestly failed — record that
        // fact for transparency, but the rule-based report remains
        // fully valid and already returned to the user regardless.
        await skillGapReportRepository.updateAiExplanation(report._id, {
          aiEnhancedExplanation: null,
          aiEnhancementStatus: 'failedFallbackUsed',
        });
      }
      // If !result.attempted (not configured/disabled/circuit open),
      // leave the record at its default 'notAttempted' — no write needed.
    } catch (error) {
      logger.error(`Unexpected error during AI skill gap explanation attempt: ${error.message}`);
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

module.exports = new SkillGapService();