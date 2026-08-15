/**
 * admin.service.js
 * -----------------------------------------
 * Business logic for the Admin Panel.
 * UPDATED (AI Enhancement Module): getAiReliabilityLogs() now reports
 * REAL, live status from the AI gateway (configured? flag enabled?
 * circuit open? service reachable?) instead of the honest "not yet
 * implemented" placeholder from Phase 18. getStats()'s
 * aiFallbackRatePercent remains null/honest since no persistent
 * aiInteractionLogs collection was built (that was explicitly out of
 * scope per the approved database design's "future AI features" note,
 * and per-request status is already visible via aiEnhancementStatus on
 * each individual resource) — this is a deliberate, documented scope
 * boundary, not an oversight.
 */

const { parse } = require('csv-parse/sync');
const ApiError = require('../../shared/errors/ApiError');
const auditLogRepository = require('./auditLog.repository');
const featureFlagRepository = require('./featureFlag.repository');
const courseRepository = require('../course/course.repository');
const skillTaxonomyRepository = require('../skill-taxonomy/skillTaxonomy.repository');
const platformRepository = require('../platform/platform.repository');
const aiGateway = require('../../ai/ai.gateway');
const { ACCOUNT_STATUS } = require('../../config/constants');

const User = require('../user/user.model');
const Course = require('../course/course.model');
const Roadmap = require('../roadmap-engine/roadmap.model');
const Platform = require('../platform/platform.model');
const SkillTaxonomy = require('../skill-taxonomy/skillTaxonomy.model');

class AdminService {
  async getStats() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsersLast30d,
      totalCourses,
      totalRoadmapsGenerated,
      totalPlatforms,
      totalSkills,
    ] = await Promise.all([
      User.countDocuments({ accountStatus: { $ne: ACCOUNT_STATUS.DELETED } }),
      User.countDocuments({
        accountStatus: ACCOUNT_STATUS.ACTIVE,
        lastLoginAt: { $gte: thirtyDaysAgo },
      }),
      Course.countDocuments({ isActive: true }),
      Roadmap.countDocuments({}),
      Platform.countDocuments({ isActive: true }),
      SkillTaxonomy.countDocuments({ isActive: true }),
    ]);

    const aiStatus = await aiGateway.getServiceStatus();

    return {
      totalUsers,
      activeUsersLast30d,
      totalCourses,
      totalRoadmapsGenerated,
      totalPlatforms,
      totalSkills,
      // Per-request AI success/failure is visible via aiEnhancementStatus
      // on individual resources (Recommendations, Skill Gap Reports,
      // Analyzer results); an aggregate percentage would require a
      // dedicated aiInteractionLogs collection, which is intentionally
      // out of scope for this module per the approved design.
      aiFallbackRatePercent: null,
      aiFeatureStatus: aiStatus.staticallyConfigured ? 'implemented' : 'not_configured',
    };
  }

  async getAuditLogs(query) {
    const { actorUserId, action, page, limit, sortBy, order } = query;
    const { items, totalItems } = await auditLogRepository.findAll({
      actorUserId,
      action,
      page,
      limit,
      sortBy,
      order,
    });

    return { items, pagination: this._buildPagination(page, limit, totalItems) };
  }

  /**
   * REAL AI reliability status, sourced live from the gateway — no
   * longer the Phase 18 placeholder. Reports each layer of the
   * resilience chain independently so an admin can diagnose exactly
   * where an AI outage sits (never configured vs. administratively
   * disabled vs. circuit-tripped vs. genuinely unreachable).
   */
  async getAiReliabilityLogs(_query) {
    const status = await aiGateway.getServiceStatus();

    return {
      available: status.staticallyConfigured,
      staticallyConfigured: status.staticallyConfigured,
      featureFlagEnabled: status.featureFlagAllowed,
      circuitBreakerOpen: status.circuitOpen,
      serviceReachable: status.serviceReachable,
      llmConfiguredOnService: status.llmConfiguredOnService,
      message: status.staticallyConfigured
        ? status.serviceReachable
          ? 'AI service is configured and reachable.'
          : 'AI service is configured but currently unreachable. The core application continues to function normally with rule-based results only.'
        : 'AI service is not configured in this deployment (AI_SERVICE_INTERNAL_KEY not set). All rule-based engines and analyzers operate fully without AI dependency.',
    };
  }

  async getFeatureFlags() {
    await featureFlagRepository.ensureKnownFlagsExist();
    return featureFlagRepository.findAll();
  }

  async updateFeatureFlag(key, enabled, modifiedByUserId) {
    return featureFlagRepository.setEnabled(key, enabled, modifiedByUserId);
  }

  async bulkImportCourses(fileBuffer) {
    let records;
    try {
      records = parse(fileBuffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch (error) {
      throw ApiError.badRequest('Could not parse the uploaded CSV file', 'INVALID_CSV_FORMAT');
    }

    let importedCount = 0;
    let skippedCount = 0;
    const errors = [];

    for (let i = 0; i < records.length; i += 1) {
      const row = records[i];
      const rowNumber = i + 2;

      try {
        const platform = await platformRepository.findBySlug(row.platformSlug);
        if (!platform) {
          throw new Error(`Platform with slug "${row.platformSlug}" not found`);
        }

        const skillSlugs = (row.skillSlugs || '').split('|').map((s) => s.trim()).filter(Boolean);
        if (skillSlugs.length === 0) {
          throw new Error('At least one skillSlugs entry is required');
        }

        const skillDocs = await Promise.all(
          skillSlugs.map((slug) => skillTaxonomyRepository.findBySlug(slug))
        );
        const missingSkills = skillSlugs.filter((_, idx) => !skillDocs[idx]);
        if (missingSkills.length > 0) {
          throw new Error(`Unknown skill slug(s): ${missingSkills.join(', ')}`);
        }

        const exists = await courseRepository.existsBySlug(this._slugify(row.title));
        if (exists) {
          skippedCount += 1;
          continue;
        }

        await courseRepository.create({
          title: row.title,
          slug: this._slugify(row.title),
          platformId: platform._id,
          instructor: row.instructor || undefined,
          description: row.description,
          skillsCovered: skillDocs.map((s) => s._id),
          level: row.level,
          durationHours: row.durationHours ? Number(row.durationHours) : undefined,
          price: {
            amount: Number(row.priceAmount) || 0,
            currency: row.priceCurrency || 'USD',
            isFree: row.isFree === 'true',
          },
          certificationOffered: row.certificationOffered === 'true',
          externalUrl: row.externalUrl,
          tags: (row.tags || '').split('|').map((t) => t.trim()).filter(Boolean),
          isActive: true,
        });

        importedCount += 1;
      } catch (rowError) {
        skippedCount += 1;
        errors.push({ row: rowNumber, message: rowError.message });
      }
    }

    return { importedCount, skippedCount, errors };
  }

  _slugify(text) {
    return text
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-');
  }

  _buildPagination(page, limit, totalItems) {
    return { page, limit, totalPages: Math.ceil(totalItems / limit), totalItems };
  }
}

module.exports = new AdminService();