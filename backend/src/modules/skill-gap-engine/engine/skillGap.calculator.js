/**
 * skillGap.calculator.js
 * -----------------------------------------
 * Pure computation layer: converts a set of per-skill gap results into
 * a single overall readiness score (0-100), weighted by each required
 * skill's importance (career path's `weight` field). This is the exact
 * metric shown on the Skill Gap Analysis dashboard gauge.
 */

/**
 * Achievement for a single skill is capped at 1.0 (100%) even if the
 * user exceeds the requirement — a career path's readiness score should
 * reflect "are you ready", not reward over-qualification in one skill
 * at the expense of others.
 *
 * @param {Array<{ skillId: any, currentLevel: number, requiredLevel: number }>} gaps
 * @param {Array<{ skillId: any, weight: number }>} requiredSkills
 * @returns {number} integer 0-100
 */
function computeOverallReadinessScore(gaps, requiredSkills) {
  const weightMap = new Map(requiredSkills.map((rs) => [rs.skillId.toString(), rs.weight]));
  const totalWeight = requiredSkills.reduce((sum, rs) => sum + rs.weight, 0);

  if (totalWeight === 0) return 0;

  const weightedAchievementSum = gaps.reduce((sum, gap) => {
    const weight = weightMap.get(gap.skillId.toString()) || 0;
    const achievement =
      gap.requiredLevel > 0 ? Math.min(gap.currentLevel / gap.requiredLevel, 1) : 1;
    return sum + achievement * weight;
  }, 0);

  const rawScore = (weightedAchievementSum / totalWeight) * 100;
  return Math.round(Math.max(0, Math.min(100, rawScore)));
}

/**
 * Sorts gaps so the most severe (critical) surface first — directly
 * supports the approved UX spec's "critical gaps always sort to top"
 * requirement for the Skill Gap Analysis page.
 */
function sortGapsBySeverity(gaps) {
  const severityRank = { critical: 0, moderate: 1, minor: 2, none: 3 };
  return [...gaps].sort((a, b) => severityRank[a.gapSeverity] - severityRank[b.gapSeverity]);
}

module.exports = {
  computeOverallReadinessScore,
  sortGapsBySeverity,
};