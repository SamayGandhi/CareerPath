/**
 * resumeAnalyzer.service.js
 * -----------------------------------------
 * Business orchestration for the Resume Analyzer.
 * UPDATED (Batch 5.4): analyze() now triggers a real "resumeAnalyzed"
 * notification after the AI-suggestion attempt completes. All prior
 * logic is unchanged.
 */

const path = require('path');
const ApiError = require('../../shared/errors/ApiError');
const resumeAnalysisRepository = require('./resumeAnalysis.repository');
const skillTaxonomyRepository = require('../skill-taxonomy/skillTaxonomy.repository');
const careerPathRepository = require('../career-path/careerPath.repository');
const { extractText } = require('./engine/textExtractor.util');
const { matchSkills } = require('./engine/skillMatcher.rule');
const { computeAtsScore } = require('./engine/atsScorer.rule');
const aiGateway = require('../../ai/ai.gateway');
const notificationService = require('../notification/notification.service');
const logger = require('../../config/logger.config');
const { PAGINATION_DEFAULTS } = require('../../config/constants');

class ResumeAnalyzerService {
  async analyze(userId, file, { targetCareerPathId } = {}) {
    if (!file) {
      throw ApiError.badRequest('No resume file was uploaded', 'FILE_MISSING');
    }

    const resumeText = await extractText(file.path, file.mimetype);

    if (!resumeText || resumeText.trim().length < 20) {
      throw ApiError.unprocessable(
        'Could not extract meaningful text from this resume. It may be image-based or empty.',
        'RESUME_UNREADABLE'
      );
    }

    const { items: allSkills } = await skillTaxonomyRepository.findAll({
      filter: { isActive: true },
      page: 1,
      limit: 1000,
    });

    const extractedSkills = matchSkills(resumeText, allSkills);
    const { atsScore, breakdown } = computeAtsScore(resumeText, extractedSkills.length);

    let missingSkillsForTarget = [];
    let resolvedCareerPathId = null;

    if (targetCareerPathId) {
      const careerPath = await careerPathRepository.findById(targetCareerPathId);
      if (!careerPath || !careerPath.isActive) {
        throw ApiError.notFound('Career path not found', 'CAREER_PATH_NOT_FOUND');
      }
      resolvedCareerPathId = careerPath._id;

      const matchedSkillIdSet = new Set(extractedSkills.map((s) => s.skillId.toString()));
      missingSkillsForTarget = careerPath.requiredSkills
        .filter((rs) => !matchedSkillIdSet.has(rs.skillId.toString()))
        .map((rs) => rs.skillId);
    }

    const relativePath = path.relative(process.cwd(), file.path).replace(/\\/g, '/');

    const analysis = await resumeAnalysisRepository.create({
      userId,
      originalFileName: file.originalname,
      storedFilePath: relativePath,
      extractedSkills: extractedSkills.map((s) => ({
        skillId: s.skillId,
        skillName: s.skillName,
        category: s.category,
        matchCount: s.matchCount,
      })),
      missingSkillsForTarget,
      targetCareerPathId: resolvedCareerPathId,
      atsScore,
      atsBreakdown: breakdown,
      aiSuggestions: null,
      aiEnhancementStatus: 'notAttempted',
    });

    const populated = await resumeAnalysisRepository.findById(analysis._id);
    await this._attemptAiSuggestions(populated);

    await notificationService.notifyUser({
      userId,
      type: 'resumeAnalyzed',
      title: 'Resume analyzed',
      message: `Your resume scored ${atsScore}/100 on ATS friendliness, with ${extractedSkills.length} skill${extractedSkills.length === 1 ? '' : 's'} detected.`,
      relatedEntityType: 'resumeAnalysis',
      relatedEntityId: analysis._id,
    });

    return resumeAnalysisRepository.findById(analysis._id);
  }

  async getHistory(userId, query) {
    const { page, limit } = query;
    const { items, totalItems } = await resumeAnalysisRepository.findAllByUser(userId, {
      page: page || PAGINATION_DEFAULTS.DEFAULT_PAGE,
      limit: limit || PAGINATION_DEFAULTS.DEFAULT_LIMIT,
    });

    return { items, pagination: this._buildPagination(page, limit, totalItems) };
  }

  async getById(analysisId, requestingUser) {
    const analysis = await resumeAnalysisRepository.findById(analysisId);
    if (!analysis) {
      throw ApiError.notFound('Resume analysis not found', 'ANALYSIS_NOT_FOUND');
    }

    const isOwner = analysis.userId.toString() === requestingUser.id;
    const isAdmin = requestingUser.role === 'admin';
    if (!isOwner && !isAdmin) {
      throw ApiError.forbidden('You do not have access to this analysis', 'FORBIDDEN');
    }

    return analysis;
  }

  async _attemptAiSuggestions(analysis) {
    try {
      const result = await aiGateway.generateResumeSuggestions({
        extractedSkills: (analysis.extractedSkills || []).map((s) => s.skillName),
        atsBreakdown: (analysis.atsBreakdown || []).map((item) => ({
          label: item.label,
          points: item.points,
          maxPoints: item.maxPoints,
          note: item.note,
        })),
        missingSkills: (analysis.missingSkillsForTarget || []).map((s) => s.skillName).filter(Boolean),
      });

      if (result.success) {
        await resumeAnalysisRepository.updateAiSuggestions(analysis._id, {
          aiSuggestions: result.suggestions,
          aiEnhancementStatus: 'success',
        });
      } else if (result.attempted) {
        await resumeAnalysisRepository.updateAiSuggestions(analysis._id, {
          aiSuggestions: null,
          aiEnhancementStatus: 'failedFallbackUsed',
        });
      }
    } catch (error) {
      logger.error(`Unexpected error during AI resume suggestions attempt: ${error.message}`);
    }
  }

  _buildPagination(page, limit, totalItems) {
    return { page, limit, totalPages: Math.ceil(totalItems / limit), totalItems };
  }
}

module.exports = new ResumeAnalyzerService();