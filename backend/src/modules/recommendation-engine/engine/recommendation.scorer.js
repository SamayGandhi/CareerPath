/**
 * recommendation.scorer.js
 * -----------------------------------------
 * Combines all rule outputs into a single weighted 0-100 score per
 * course, using the active strategy's weights. Pure computation —
 * no I/O.
 */

/**
 * @param {Record<string, { score: number, reasons: string[] }>} ruleResults
 *   - keyed by rule name, e.g. { skillGapCoverage: {...}, budgetFit: {...} }
 * @param {Record<string, number>} weights - from the active strategy
 * @returns {{ score: number, reasons: string[], ruleBreakdown: Array<{ ruleName: string, contribution: number }> }}
 */
function computeWeightedScore(ruleResults, weights) {
  let weightedSum = 0;
  const allReasons = [];
  const ruleBreakdown = [];

  for (const [ruleName, weight] of Object.entries(weights)) {
    const result = ruleResults[ruleName];
    if (!result) continue;

    const contribution = result.score * weight;
    weightedSum += contribution;

    ruleBreakdown.push({
      ruleName,
      contribution: Math.round(contribution * 100),
    });

    if (result.reasons && result.reasons.length > 0) {
      allReasons.push(...result.reasons);
    }
  }

  const score = Math.round(Math.max(0, Math.min(1, weightedSum)) * 100);

  // Highest-contributing rules' reasons surface first — most explanatory
  // value at the top of the "Why this?" panel.
  ruleBreakdown.sort((a, b) => b.contribution - a.contribution);

  return { score, reasons: allReasons, ruleBreakdown };
}

module.exports = { computeWeightedScore };