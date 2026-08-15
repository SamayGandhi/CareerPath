/**
 * repoQuality.rule.js
 * -----------------------------------------
 * RULE: Deterministic repo-quality signal heuristics — checks for
 * README presence, recent commit activity, and description quality
 * across a user's repositories. Fully explainable, no AI involved.
 */

const RECENT_ACTIVITY_DAYS = 180;

/**
 * @param {Array<{
 *   name: string, description: string|null, updated_at: string,
 *   fork: boolean, stargazers_count: number, has_wiki: boolean
 * }>} repos - raw GitHub repo objects
 * @returns {{
 *   hasReadmes: boolean,
 *   readmeCoveragePercentage: number,
 *   hasRecentActivity: boolean,
 *   commitFrequencySignal: string,
 *   originalRepoCount: number,
 *   totalStars: number,
 *   qualitySignals: Array<{ label: string, passed: boolean, note: string }>
 * }}
 */
function evaluateRepoQuality(repos, repoDescriptionFlags) {
  const originalRepos = repos.filter((r) => !r.fork);
  const originalRepoCount = originalRepos.length;

  if (originalRepoCount === 0) {
    return {
      hasReadmes: false,
      readmeCoveragePercentage: 0,
      hasRecentActivity: false,
      commitFrequencySignal: 'insufficientData',
      originalRepoCount: 0,
      totalStars: 0,
      qualitySignals: [
        {
          label: 'Original repositories',
          passed: false,
          note: 'No original (non-forked) repositories found to analyze',
        },
      ],
    };
  }

  const reposWithDescription = originalRepos.filter(
    (r) => r.description && r.description.trim().length > 10
  );
  const descriptionCoverage = Math.round((reposWithDescription.length / originalRepoCount) * 100);

  // repoDescriptionFlags carries README presence per repo (fetched
  // separately by the service, since GitHub's basic repo list endpoint
  // doesn't include README existence directly).
  const reposWithReadme = repoDescriptionFlags.filter((f) => f.hasReadme).length;
  const readmeCoveragePercentage =
    originalRepoCount > 0 ? Math.round((reposWithReadme / originalRepoCount) * 100) : 0;

  const cutoffDate = new Date(Date.now() - RECENT_ACTIVITY_DAYS * 24 * 60 * 60 * 1000);
  const recentlyUpdatedRepos = originalRepos.filter((r) => new Date(r.updated_at) >= cutoffDate);
  const hasRecentActivity = recentlyUpdatedRepos.length > 0;

  let commitFrequencySignal;
  const recentRatio = recentlyUpdatedRepos.length / originalRepoCount;
  if (recentRatio >= 0.5) commitFrequencySignal = 'active';
  else if (recentRatio > 0) commitFrequencySignal = 'occasional';
  else commitFrequencySignal = 'inactive';

  const totalStars = originalRepos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);

  const qualitySignals = [
    {
      label: 'README files present',
      passed: readmeCoveragePercentage >= 50,
      note: `${readmeCoveragePercentage}% of original repos have a README`,
    },
    {
      label: 'Descriptive repository summaries',
      passed: descriptionCoverage >= 50,
      note: `${descriptionCoverage}% of original repos have a meaningful description`,
    },
    {
      label: 'Recent activity',
      passed: hasRecentActivity,
      note: hasRecentActivity
        ? `${recentlyUpdatedRepos.length} repo(s) updated in the last ${RECENT_ACTIVITY_DAYS} days`
        : `No repos updated in the last ${RECENT_ACTIVITY_DAYS} days`,
    },
  ];

  return {
    hasReadmes: readmeCoveragePercentage >= 50,
    readmeCoveragePercentage,
    hasRecentActivity,
    commitFrequencySignal,
    originalRepoCount,
    totalStars,
    qualitySignals,
  };
}

module.exports = { evaluateRepoQuality, RECENT_ACTIVITY_DAYS };