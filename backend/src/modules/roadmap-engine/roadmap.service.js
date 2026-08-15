/**
 * roadmap.service.js
 * -----------------------------------------
 * Business orchestration for the Roadmap Engine.
 * UPDATED (Phase 16): updateStageStatus() now triggers a real
 * notification via notificationService.notifyUser() when a stage is
 * marked completed, and another when the roadmap itself is fully
 * completed — a genuine event-driven side effect, not a placeholder.
 */

const ApiError = require('../../shared/errors/ApiError');
const roadmapRepository = require('./roadmap.repository');
const recommendationRepository = require('../recommendation-engine/recommendation.repository');
const skillGapReportRepository = require('../skill-gap-engine/skillGapReport.repository');
const skillTaxonomyRepository = require('../skill-taxonomy/skillTaxonomy.repository');
const careerPathRepository = require('../career-path/careerPath.repository');
const profileRepository = require('../profile/profile.repository');
const notificationService = require('../notification/notification.service');
const roadmapBuilder = require('./engine/roadmap.builder');
const { getDefaultTemplate } = require('./engine/templates/defaultTemplate');
const { PAGINATION_DEFAULTS } = require('../../config/constants');

class RoadmapService {
  async generate(userId, { recommendationId, force }) {
    const recommendation = await recommendationRepository.findById(recommendationId);
    if (!recommendation) {
      throw ApiError.notFound('Recommendation not found', 'RECOMMENDATION_NOT_FOUND');
    }
    if (recommendation.userId.toString() !== userId) {
      throw ApiError.forbidden('This recommendation does not belong to you', 'FORBIDDEN');
    }

    const existingActive = await roadmapRepository.findActiveByUser(userId);
    if (existingActive && !force) {
      throw ApiError.conflict(
        'You already have an active roadmap. Pass force=true to archive it and generate a new one.',
        'ACTIVE_ROADMAP_EXISTS'
      );
    }

    const skillGapReport = await skillGapReportRepository.findById(recommendation.skillGapReportId);
    if (!skillGapReport) {
      throw ApiError.notFound('Source skill gap report not found', 'SKILL_GAP_REPORT_NOT_FOUND');
    }

    const careerPath = await careerPathRepository.findById(skillGapReport.targetCareerPathId);
    if (!careerPath) {
      throw ApiError.notFound('Career path not found', 'CAREER_PATH_NOT_FOUND');
    }

    const profile = await profileRepository.findByUserId(userId);

    const roadmapData = await this._buildRoadmapData({
      skillGapReport,
      recommendation,
      profile,
    });

    if (existingActive && force) {
      await roadmapRepository.deactivateAllForUser(userId);
    }

    const roadmap = await roadmapRepository.create({
      userId,
      careerPathId: careerPath._id,
      recommendationId: recommendation._id,
      title: `${careerPath.title} Roadmap`,
      stages: roadmapData.stages,
      estimatedTotalDurationWeeks: roadmapData.estimatedTotalDurationWeeks,
      status: 'notStarted',
      currentStageIndex: 0,
      isActive: true,
    });

    return roadmapRepository.findById(roadmap._id);
  }

  async getActive(userId) {
    const roadmap = await roadmapRepository.findActiveByUser(userId);
    if (!roadmap) {
      throw ApiError.notFound(
        'No active roadmap found. Please generate one first.',
        'NO_ACTIVE_ROADMAP'
      );
    }
    return roadmap;
  }

  async getAllForUser(userId, query) {
    const { page, limit, status } = query;
    const { items, totalItems } = await roadmapRepository.findAllByUser(userId, {
      page: page || PAGINATION_DEFAULTS.DEFAULT_PAGE,
      limit: limit || PAGINATION_DEFAULTS.DEFAULT_LIMIT,
      status,
    });

    return { items, pagination: this._buildPagination(page, limit, totalItems) };
  }

  async getById(id, requestingUser) {
    const roadmap = await roadmapRepository.findById(id);
    if (!roadmap) {
      throw ApiError.notFound('Roadmap not found', 'ROADMAP_NOT_FOUND');
    }

    const isOwner = roadmap.userId.toString() === requestingUser.id;
    const isAdmin = requestingUser.role === 'admin';
    if (!isOwner && !isAdmin) {
      throw ApiError.forbidden('You do not have access to this roadmap', 'FORBIDDEN');
    }

    return roadmap;
  }

  /**
   * Updates a stage's status, enforcing sequential unlock. Now also
   * triggers real notifications on meaningful transitions: completing
   * a stage notifies the user and, if it was the final stage, a
   * separate "roadmap completed" notification fires too.
   */
  async updateStageStatus(roadmapId, stageId, newStatus, requestingUserId) {
    const roadmap = await roadmapRepository.findRawById(roadmapId);
    if (!roadmap) {
      throw ApiError.notFound('Roadmap not found', 'ROADMAP_NOT_FOUND');
    }
    if (roadmap.userId.toString() !== requestingUserId) {
      throw ApiError.forbidden('This roadmap does not belong to you', 'FORBIDDEN');
    }

    const stageIndex = roadmap.stages.findIndex((s) => s.stageId === stageId);
    if (stageIndex === -1) {
      throw ApiError.notFound('Stage not found in this roadmap', 'STAGE_NOT_FOUND');
    }

    const stage = roadmap.stages[stageIndex];

    if (
      (newStatus === 'inProgress' || newStatus === 'completed') &&
      stage.unlockCondition === 'previousStageComplete' &&
      stageIndex > 0
    ) {
      const previousStage = roadmap.stages[stageIndex - 1];
      if (previousStage.status !== 'completed') {
        throw ApiError.unprocessable(
          `Complete "${roadmap.stages[stageIndex - 1].title}" before starting this stage.`,
          'STAGE_LOCKED'
        );
      }
    }

    const wasAlreadyCompleted = stage.status === 'completed';
    stage.status = newStatus;

    let nextStageUnlocked = false;

    if (newStatus === 'completed' && stageIndex + 1 < roadmap.stages.length) {
      const nextStage = roadmap.stages[stageIndex + 1];
      if (nextStage.status === 'locked') {
        nextStage.status = 'unlocked';
        nextStageUnlocked = true;
      }
      roadmap.currentStageIndex = stageIndex + 1;
    }

    const allCompleted = roadmap.stages.every((s) => s.status === 'completed');
    const anyStarted = roadmap.stages.some((s) => s.status === 'inProgress' || s.status === 'completed');

    if (allCompleted) {
      roadmap.status = 'completed';
    } else if (anyStarted) {
      roadmap.status = 'inProgress';
    }

    await roadmapRepository.save(roadmap);

    // ---- Real notification side effects (not a placeholder) ----
    // Only fire on a genuine NEW completion, not a redundant re-save of
    // an already-completed stage, to avoid duplicate notification spam.
    if (newStatus === 'completed' && !wasAlreadyCompleted) {
      await notificationService.notifyUser({
        userId: requestingUserId,
        type: 'stageCompleted',
        title: `Stage completed: ${stage.title}`,
        message: nextStageUnlocked
          ? `Great work! You've completed "${stage.title}". The next stage is now unlocked.`
          : `Great work! You've completed "${stage.title}".`,
        relatedEntityType: 'roadmap',
        relatedEntityId: roadmap._id,
      });

      if (allCompleted) {
        await notificationService.notifyUser({
          userId: requestingUserId,
          type: 'stageCompleted',
          title: 'Roadmap completed!',
          message: `Congratulations! You've completed every stage of "${roadmap.title}".`,
          relatedEntityType: 'roadmap',
          relatedEntityId: roadmap._id,
        });
      }
    }

    return roadmapRepository.findById(roadmap._id);
  }

  async regenerate(roadmapId, requestingUserId) {
    const existing = await roadmapRepository.findRawById(roadmapId);
    if (!existing) {
      throw ApiError.notFound('Roadmap not found', 'ROADMAP_NOT_FOUND');
    }
    if (existing.userId.toString() !== requestingUserId) {
      throw ApiError.forbidden('This roadmap does not belong to you', 'FORBIDDEN');
    }

    const recommendation = await recommendationRepository.findById(existing.recommendationId);
    const skillGapReport = await skillGapReportRepository.findById(recommendation.skillGapReportId);
    const profile = await profileRepository.findByUserId(requestingUserId);

    const rebuilt = await this._buildRoadmapData({ skillGapReport, recommendation, profile });

    const previousStatusByStageId = new Map(existing.stages.map((s) => [s.stageId, s.status]));

    const mergedStages = rebuilt.stages.map((stage, index) => {
      const previousStatus = previousStatusByStageId.get(stage.stageId);
      if (previousStatus === 'completed') {
        return { ...stage, status: 'completed' };
      }
      if (index === 0) return { ...stage, status: previousStatus || 'unlocked' };
      return stage;
    });

    existing.stages = mergedStages;
    existing.estimatedTotalDurationWeeks = rebuilt.estimatedTotalDurationWeeks;

    await roadmapRepository.save(existing);
    return roadmapRepository.findById(existing._id);
  }

  async abandon(roadmapId, requestingUserId) {
    const roadmap = await roadmapRepository.findRawById(roadmapId);
    if (!roadmap) {
      throw ApiError.notFound('Roadmap not found', 'ROADMAP_NOT_FOUND');
    }
    if (roadmap.userId.toString() !== requestingUserId) {
      throw ApiError.forbidden('This roadmap does not belong to you', 'FORBIDDEN');
    }

    roadmap.status = 'abandoned';
    roadmap.isActive = false;
    await roadmapRepository.save(roadmap);
    return roadmapRepository.findById(roadmap._id);
  }

  async _buildRoadmapData({ skillGapReport, recommendation, profile }) {
    const relevantSkillIds = skillGapReport.gaps
      .filter((g) => g.gapSeverity !== 'none')
      .map((g) => g.skillId);

    const skillTaxonomyList = await skillTaxonomyRepository.findByIds(relevantSkillIds);
    const skillTaxonomyMap = new Map(skillTaxonomyList.map((s) => [s._id.toString(), s]));

    const courseSkillsMap = new Map();
    for (const rc of recommendation.recommendedCourses) {
      const course = rc.courseId;
      if (course && course.skillsCovered) {
        courseSkillsMap.set(
          course._id.toString(),
          course.skillsCovered.map((s) => (s._id || s).toString())
        );
      }
    }

    const template = getDefaultTemplate();

    return roadmapBuilder.buildRoadmap({
      gaps: skillGapReport.gaps,
      skillTaxonomyMap,
      recommendedCourses: recommendation.recommendedCourses.map((rc) => ({
        courseId: rc.courseId._id || rc.courseId,
        score: rc.score,
      })),
      courseSkillsMap,
      template,
      weeklyTimeCommitmentHours: profile?.weeklyTimeCommitmentHours,
    });
  }

  _buildPagination(page, limit, totalItems) {
    return { page, limit, totalPages: Math.ceil(totalItems / limit), totalItems };
  }
}

module.exports = new RoadmapService();