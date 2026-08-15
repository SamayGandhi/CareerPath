/**
 * dashboard.service.js
 * -----------------------------------------
 * Aggregates data across Profile, Skill Gap, Recommendation, Roadmap,
 * Progress, Notifications, Assessment, and Interview Prep into a
 * single composed response.
 * UPDATED (Batch 5.5): added latestAssessment and interviewReadiness
 * to getSummary()'s response — both additive fields, sourced from
 * already-existing repositories/services with zero new business logic.
 * Every existing field is untouched; the response envelope is only
 * ever extended, never restructured.
 */

const profileRepository = require('../profile/profile.repository');
const skillGapReportRepository = require('../skill-gap-engine/skillGapReport.repository');
const recommendationRepository = require('../recommendation-engine/recommendation.repository');
const roadmapRepository = require('../roadmap-engine/roadmap.repository');
const progressService = require('../progress-tracker/progress.service');
const notificationRepository = require('../notification/notification.repository');
const assessmentRepository = require('../assessment/assessment.repository');
const interviewPrepService = require('../interview-prep/interviewPrep.service');

class DashboardService {
  async getSummary(userId) {
    const [
      profile,
      latestSkillGapReport,
      latestRecommendation,
      activeRoadmap,
      recentNotifications,
      latestAssessmentResult,
      interviewReadiness,
    ] = await Promise.all([
      this._safe(() => profileRepository.findByUserId(userId)),
      this._safe(() => skillGapReportRepository.findLatestByUser(userId)),
      this._safe(() => recommendationRepository.findLatestByUser(userId)),
      this._safe(() => roadmapRepository.findActiveByUser(userId)),
      this._safe(() => notificationRepository.findRecentByUser(userId, 5)),
      this._safe(() => assessmentRepository.findAllByUserId(userId, { page: 1, limit: 1 })),
      this._safe(() => interviewPrepService.getReadinessScore(userId)),
    ]);

    let roadmapProgressSummary = null;
    if (activeRoadmap) {
      roadmapProgressSummary = await this._safe(() =>
        progressService.getRoadmapSummary(activeRoadmap._id, userId)
      );
    }

    const upcomingStage = activeRoadmap
      ? activeRoadmap.stages.find((s) => s.status === 'unlocked' || s.status === 'inProgress') || null
      : null;

    const latestAssessmentDoc = latestAssessmentResult?.items?.[0] || null;

    return {
      profileCompletion: profile ? profile.profileCompletionPercentage : 0,
      latestReadinessScore: latestSkillGapReport ? latestSkillGapReport.overallReadinessScore : null,
      latestSkillGapReportId: latestSkillGapReport ? latestSkillGapReport._id : null,
      topSkillGaps: latestSkillGapReport
        ? latestSkillGapReport.gaps
            .filter((g) => g.gapSeverity === 'critical' || g.gapSeverity === 'moderate')
            .slice(0, 3)
        : [],
      latestRecommendation: latestRecommendation
        ? {
            id: latestRecommendation._id,
            topCourse: latestRecommendation.recommendedCourses[0] || null,
          }
        : null,
      activeRoadmap: activeRoadmap
        ? {
            id: activeRoadmap._id,
            title: activeRoadmap.title,
            status: activeRoadmap.status,
            currentStageIndex: activeRoadmap.currentStageIndex,
            totalStages: activeRoadmap.stages.length,
            estimatedTotalDurationWeeks: activeRoadmap.estimatedTotalDurationWeeks,
            upcomingStage,
          }
        : null,
      roadmapProgressSummary,
      recentNotifications: recentNotifications || [],
      hasCompletedOnboarding: Boolean(profile && profile.profileCompletionPercentage >= 50),
      latestAssessment: latestAssessmentDoc
        ? {
            id: latestAssessmentDoc._id,
            completedAt: latestAssessmentDoc.completedAt,
            skillsUpdatedCount: (latestAssessmentDoc.derivedSkills || []).length,
          }
        : null,
      interviewReadiness: interviewReadiness || null,
    };
  }

  async getAnalytics(userId, range) {
    const RANGE_TO_DAYS = { '7d': 7, '30d': 30, '90d': 90, all: null };
    const days = RANGE_TO_DAYS[range];
    const { items: allReports } = await skillGapReportRepository.findHistoryByUser
      ? await skillGapReportRepository.findHistoryByUser(userId, { page: 1, limit: 100 })
      : { items: [] };

    const cutoffDate = days ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : null;

    const filteredReports = (allReports || [])
      .filter((r) => !cutoffDate || new Date(r.createdAt) >= cutoffDate)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    const readinessScoreTrend = filteredReports.map((r) => ({
      date: r.createdAt,
      score: r.overallReadinessScore,
    }));

    return { readinessScoreTrend, range };
  }

  async _safe(fn) {
    try {
      return await fn();
    } catch (error) {
      return null;
    }
  }
}

module.exports = new DashboardService();