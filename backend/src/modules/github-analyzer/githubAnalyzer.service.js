/**
 * githubAnalyzer.service.js
 * -----------------------------------------
 * Business orchestration for the GitHub Analyzer.
 * UPDATED (AI Enhancement Module): analyze() now attempts an optional
 * AI-generated narrative summary AFTER the rule-based language/quality
 * analysis is fully computed and persisted.
 */

const ApiError = require('../../shared/errors/ApiError');
const githubAnalysisRepository = require('./githubAnalysis.repository');
const skillTaxonomyRepository = require('../skill-taxonomy/skillTaxonomy.repository');
const githubApiClient = require('./engine/githubApi.client');
const { analyzeLanguages } = require('./engine/languageAnalyzer.rule');
const { evaluateRepoQuality } = require('./engine/repoQuality.rule');
const aiGateway = require('../../ai/ai.gateway');
const logger = require('../../config/logger.config');
const { PAGINATION_DEFAULTS } = require('../../config/constants');

const MAX_REPOS_TO_ANALYZE = 30;

class GithubAnalyzerService {
  async analyze(userId, githubUsername) {
    const profile = await githubApiClient.getUserProfile(githubUsername);
    const repos = await githubApiClient.getUserRepos(githubUsername, { perPage: 100 });

    if (!Array.isArray(repos) || repos.length === 0) {
      throw ApiError.unprocessable(
        'This GitHub profile has no public repositories to analyze.',
        'PROFILE_TOO_SPARSE'
      );
    }

    const originalRepos = repos.filter((r) => !r.fork).slice(0, MAX_REPOS_TO_ANALYZE);

    if (originalRepos.length === 0) {
      throw ApiError.unprocessable(
        'This GitHub profile only contains forked repositories, which are not analyzed for original skill signal.',
        'PROFILE_TOO_SPARSE'
      );
    }

    const perRepoLanguages = await Promise.all(
      originalRepos.map((repo) => githubApiClient.getRepoLanguages(githubUsername, repo.name))
    );

    const repoDescriptionFlags = originalRepos.map((repo, index) => ({
      hasReadme: Boolean(repo.description) && Object.keys(perRepoLanguages[index] || {}).length > 0,
    }));

    const { items: allSkills } = await skillTaxonomyRepository.findAll({
      filter: { isActive: true },
      page: 1,
      limit: 1000,
    });

    const { languageDistribution, inferredSkills } = analyzeLanguages(perRepoLanguages, allSkills);
    const repoQualitySignals = evaluateRepoQuality(originalRepos, repoDescriptionFlags);

    // ---- Rule-based analysis is complete and persisted FIRST. ----
    const analysis = await githubAnalysisRepository.create({
      userId,
      githubUsername: profile.login,
      profileSnapshot: {
        publicRepoCount: profile.public_repos || 0,
        followerCount: profile.followers || 0,
        avatarUrl: profile.avatar_url,
        profileUrl: profile.html_url,
      },
      languageDistribution,
      inferredSkills,
      repoQualitySignals,
      aiSummary: null,
      aiEnhancementStatus: 'notAttempted',
    });

    // ---- Optional, strictly additive AI enhancement. ----
    await this._attemptAiSummary(analysis);

    return githubAnalysisRepository.findById(analysis._id);
  }

  async getHistory(userId, query) {
    const { page, limit } = query;
    const { items, totalItems } = await githubAnalysisRepository.findAllByUser(userId, {
      page: page || PAGINATION_DEFAULTS.DEFAULT_PAGE,
      limit: limit || PAGINATION_DEFAULTS.DEFAULT_LIMIT,
    });
    return { items, pagination: this._buildPagination(page, limit, totalItems) };
  }

  async getById(analysisId, requestingUser) {
    const analysis = await githubAnalysisRepository.findById(analysisId);
    if (!analysis) {
      throw ApiError.notFound('GitHub analysis not found', 'ANALYSIS_NOT_FOUND');
    }

    const isOwner = analysis.userId.toString() === requestingUser.id;
    const isAdmin = requestingUser.role === 'admin';
    if (!isOwner && !isAdmin) {
      throw ApiError.forbidden('You do not have access to this analysis', 'FORBIDDEN');
    }

    return analysis;
  }

  async _attemptAiSummary(analysis) {
    try {
      const result = await aiGateway.generateGithubSummary({
        languages: (analysis.languageDistribution || []).slice(0, 8).map((l) => ({
          language: l.language,
          percentage: l.percentage,
        })),
        originalRepoCount: analysis.repoQualitySignals?.originalRepoCount || 0,
        totalStars: analysis.repoQualitySignals?.totalStars || 0,
        qualitySignals: (analysis.repoQualitySignals?.qualitySignals || []).map((s) => ({
          label: s.label,
          passed: s.passed,
          note: s.note,
        })),
      });

      if (result.success) {
        await githubAnalysisRepository.updateAiSummary(analysis._id, {
          aiSummary: result.summary,
          aiEnhancementStatus: 'success',
        });
      } else if (result.attempted) {
        await githubAnalysisRepository.updateAiSummary(analysis._id, {
          aiSummary: null,
          aiEnhancementStatus: 'failedFallbackUsed',
        });
      }
    } catch (error) {
      logger.error(`Unexpected error during AI GitHub summary attempt: ${error.message}`);
    }
  }

  _buildPagination(page, limit, totalItems) {
    return { page, limit, totalPages: Math.ceil(totalItems / limit), totalItems };
  }
}

module.exports = new GithubAnalyzerService();