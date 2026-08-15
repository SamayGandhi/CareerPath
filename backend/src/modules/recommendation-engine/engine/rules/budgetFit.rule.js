/**
 * budgetFit.rule.js
 * -----------------------------------------
 * RULE: Scores how well a course's price aligns with the user's stated
 * budget preference. Deterministic tiered mapping — no guesswork.
 */

const BUDGET_MAX_THRESHOLDS = {
  free: 0,
  low: 1500, // in the platform's base currency unit (e.g. INR/USD equivalent tier)
  medium: 5000,
  premium: 20000,
  noConstraint: Infinity,
};

/**
 * @param {object} params
 * @param {{ price: { amount: number, isFree: boolean } }} params.course
 * @param {string} params.budgetPreference
 * @returns {{ score: number, reasons: string[] }}
 */
function evaluate({ course, budgetPreference }) {
  const price = course.price?.amount || 0;
  const isFree = course.price?.isFree || false;

  if (!budgetPreference || budgetPreference === 'noConstraint') {
    return { score: 1, reasons: [] };
  }

  if (isFree) {
    return { score: 1, reasons: ['Free — fits any budget'] };
  }

  const maxThreshold = BUDGET_MAX_THRESHOLDS[budgetPreference];

  if (price <= maxThreshold) {
    // Reward being comfortably under budget rather than right at the edge
    const comfortRatio = maxThreshold > 0 ? 1 - price / maxThreshold : 1;
    const score = 0.7 + 0.3 * Math.max(0, comfortRatio);
    return { score: Math.min(1, score), reasons: ['Fits within your budget preference'] };
  }

  // Over budget — score decays the further over it goes, never hits zero
  // outright (a slightly-over course may still be worth surfacing lower).
  const overageRatio = (price - maxThreshold) / maxThreshold;
  const score = Math.max(0, 0.4 - overageRatio * 0.4);

  return { score, reasons: [] };
}

module.exports = { evaluate, BUDGET_MAX_THRESHOLDS };