/**
 * portfolioAnalyzer.service.js
 * -----------------------------------------
 * Business orchestration for the Portfolio Analyzer.
 * UPDATED (AI Enhancement Module): analyze() now attempts optional AI
 * feedback AFTER the rule-based section/tech-stack detection and
 * completeness score are fully computed and persisted.
 */

const cheerio = require('cheerio');
const ApiError = require('../../shared/errors/ApiError');
const portfolioAnalysisRepository = require('./portfolioAnalysis.repository');
const { fetchHtml } = require('./engine/htmlFetcher.util');
const { detectSections } = require('./engine/sectionDetector.rule');
const { computeCompletenessScore } = require('./engine/completenessScorer.rule');
const aiGateway = require('../../ai/ai.gateway');
const logger = require('../../config/logger.config');
const { PAGINATION_DEFAULTS } = require('../../config/constants');

class PortfolioAnalyzerService {
  async analyze(userId, portfolioUrl) {
    const html = await fetchHtml(portfolioUrl);

    if (!html || html.trim().length < 50) {
      throw ApiError.unprocessable(
        'The provided URL returned no meaningful content to analyze.',
        'URL_UNREACHABLE'
      );
    }

    const $ = cheerio.load(html);

    const { detectedSections, projectCount, techStackDetected } = detectSections($);
    const { completenessScore, breakdown } = computeCompletenessScore(
      detectedSections,
      projectCount,
      techStackDetected
    );

    // ---- Rule-based analysis is complete and persisted FIRST. ----
    const analysis = await portfolioAnalysisRepository.create({
      userId,
      portfolioUrl,
      detectedSections,
      projectCount,
      techStackDetected,
      completenessScore,
      completenessBreakdown: breakdown,
      aiFeedback: null,
      aiEnhancementStatus: 'notAttempted',
    });

    // ---- Optional, strictly additive AI enhancement. ----
    await this._attemptAiFeedback(analysis);

    return portfolioAnalysisRepository.findById(analysis._id);
  }

  async getHistory(userId, query) {
    const { page, limit } = query;
    const { items, totalItems } = await portfolioAnalysisRepository.findAllByUser(userId, {
      page: page || PAGINATION_DEFAULTS.DEFAULT_PAGE,
      limit: limit || PAGINATION_DEFAULTS.DEFAULT_LIMIT,
    });
    return { items, pagination: this._buildPagination(page, limit, totalItems) };
  }

  async getById(analysisId, requestingUser) {
    const analysis = await portfolioAnalysisRepository.findById(analysisId);
    if (!analysis) {
      throw ApiError.notFound('Portfolio analysis not found', 'ANALYSIS_NOT_FOUND');
    }

    const isOwner = analysis.userId.toString() === requestingUser.id;
    const isAdmin = requestingUser.role === 'admin';
    if (!isOwner && !isAdmin) {
      throw ApiError.forbidden('You do not have access to this analysis', 'FORBIDDEN');
    }

    return analysis;
  }

  async _attemptAiFeedback(analysis) {
    try {
      const result = await aiGateway.generatePortfolioFeedback({
        detectedSections: {
          about: Boolean(analysis.detectedSections?.about),
          projects: Boolean(analysis.detectedSections?.projects),
          skills: Boolean(analysis.detectedSections?.skills),
          experience: Boolean(analysis.detectedSections?.experience),
          contact: Boolean(analysis.detectedSections?.contact),
        },
        projectCount: analysis.projectCount || 0,
        techStackDetected: analysis.techStackDetected || [],
      });

      if (result.success) {
        await portfolioAnalysisRepository.updateAiFeedback(analysis._id, {
          aiFeedback: result.feedback,
          aiEnhancementStatus: 'success',
        });
      } else if (result.attempted) {
        await portfolioAnalysisRepository.updateAiFeedback(analysis._id, {
          aiFeedback: null,
          aiEnhancementStatus: 'failedFallbackUsed',
        });
      }
    } catch (error) {
      logger.error(`Unexpected error during AI portfolio feedback attempt: ${error.message}`);
    }
  }

  _buildPagination(page, limit, totalItems) {
    return { page, limit, totalPages: Math.ceil(totalItems / limit), totalItems };
  }
}

module.exports = new PortfolioAnalyzerService();