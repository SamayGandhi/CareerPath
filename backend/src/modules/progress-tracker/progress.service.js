/**
 * progress.service.js
 * -----------------------------------------
 * Business logic for Progress Tracking. Includes the roadmap-progress
 * summary aggregation used by the Dashboard (Phase 10) and the Roadmap
 * page's progress bar.
 */

const ApiError = require('../../shared/errors/ApiError');
const progressRepository = require('./progress.repository');
const roadmapRepository = require('../roadmap-engine/roadmap.repository');
const { PAGINATION_DEFAULTS } = require('../../config/constants');

class ProgressService {
  async create(userId, data) {
    const roadmap = await roadmapRepository.findRawById(data.roadmapId);
    if (!roadmap) {
      throw ApiError.notFound('Roadmap not found', 'ROADMAP_NOT_FOUND');
    }
    if (roadmap.userId.toString() !== userId) {
      throw ApiError.forbidden('This roadmap does not belong to you', 'FORBIDDEN');
    }

    const stageExists = roadmap.stages.some((s) => s.stageId === data.stageId);
    if (!stageExists) {
      throw ApiError.notFound('Stage not found in this roadmap', 'STAGE_NOT_FOUND');
    }

    // Prevent duplicate progress records for the same user+course pair —
    // if one already exists, return it rather than creating a conflicting
    // second record for the same enrollment.
    if (data.courseId) {
      const existing = await progressRepository.findOneByUserAndCourse(userId, data.courseId);
      if (existing) return existing;
    }

    return progressRepository.create({
      userId,
      ...data,
      status: 'notStarted',
      completionPercentage: 0,
    });
  }

  async update(progressId, userId, updateData) {
    const progress = await progressRepository.findRawById(progressId);
    if (!progress) {
      throw ApiError.notFound('Progress entry not found', 'PROGRESS_NOT_FOUND');
    }
    if (progress.userId.toString() !== userId) {
      throw ApiError.forbidden('This progress entry does not belong to you', 'FORBIDDEN');
    }

    if (updateData.status !== undefined) progress.status = updateData.status;
    if (updateData.completionPercentage !== undefined) {
      progress.completionPercentage = updateData.completionPercentage;
    }

    await progressRepository.save(progress);
    return progressRepository.findById(progress._id);
  }

  async getAllForUser(userId, query) {
    const { page, limit, roadmapId, status } = query;
    const { items, totalItems } = await progressRepository.findAllByUser(userId, {
      roadmapId,
      status,
      page: page || PAGINATION_DEFAULTS.DEFAULT_PAGE,
      limit: limit || PAGINATION_DEFAULTS.DEFAULT_LIMIT,
    });

    return { items, pagination: this._buildPagination(page, limit, totalItems) };
  }

  /**
   * Aggregates all progress entries for a roadmap into an overall
   * completion percentage and a per-stage breakdown — consumed by both
   * the Roadmap page's progress bar and the Dashboard (Phase 10).
   */
  async getRoadmapSummary(roadmapId, userId) {
    const roadmap = await roadmapRepository.findRawById(roadmapId);
    if (!roadmap) {
      throw ApiError.notFound('Roadmap not found', 'ROADMAP_NOT_FOUND');
    }
    if (roadmap.userId.toString() !== userId) {
      throw ApiError.forbidden('This roadmap does not belong to you', 'FORBIDDEN');
    }

    const progressEntries = await progressRepository.findAllByRoadmap(userId, roadmapId);
    const progressByStage = new Map();

    for (const entry of progressEntries) {
      if (!progressByStage.has(entry.stageId)) {
        progressByStage.set(entry.stageId, []);
      }
      progressByStage.get(entry.stageId).push(entry);
    }

    const stageBreakdown = roadmap.stages.map((stage) => {
      const entries = progressByStage.get(stage.stageId) || [];
      const avgCompletion =
        entries.length > 0
          ? Math.round(entries.reduce((sum, e) => sum + e.completionPercentage, 0) / entries.length)
          : stage.status === 'completed'
            ? 100
            : 0;

      return {
        stageId: stage.stageId,
        title: stage.title,
        stageStatus: stage.status,
        activityCount: entries.length,
        completedActivityCount: entries.filter((e) => e.status === 'completed').length,
        averageCompletionPercentage: avgCompletion,
      };
    });

    const overallPercentage =
      stageBreakdown.length > 0
        ? Math.round(
            stageBreakdown.reduce((sum, s) => sum + s.averageCompletionPercentage, 0) /
              stageBreakdown.length
          )
        : 0;

    return { overallPercentage, stageBreakdown };
  }

  _buildPagination(page, limit, totalItems) {
    return { page, limit, totalPages: Math.ceil(totalItems / limit), totalItems };
  }
}

module.exports = new ProgressService();