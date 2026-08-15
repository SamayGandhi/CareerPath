/**
 * timeCommitment.rule.js
 * -----------------------------------------
 * RULE: Scores how well a course's estimated duration fits the user's
 * stated weekly time commitment — favors courses completable in a
 * reasonable timeframe given their availability, without over-penalizing
 * longer, high-value courses.
 */

const IDEAL_COMPLETION_WEEKS_MIN = 2;
const IDEAL_COMPLETION_WEEKS_MAX = 12;

/**
 * @param {object} params
 * @param {{ durationHours: number }} params.course
 * @param {number} params.weeklyTimeCommitmentHours
 * @returns {{ score: number, reasons: string[] }}
 */
function evaluate({ course, weeklyTimeCommitmentHours }) {
  const durationHours = course.durationHours;

  if (!durationHours || !weeklyTimeCommitmentHours) {
    return { score: 0.7, reasons: [] }; // neutral-ish score when data is missing
  }

  const estimatedWeeks = durationHours / weeklyTimeCommitmentHours;

  let score;
  let reason = null;

  if (estimatedWeeks >= IDEAL_COMPLETION_WEEKS_MIN && estimatedWeeks <= IDEAL_COMPLETION_WEEKS_MAX) {
    score = 1;
    reason = `Fits your schedule — about ${Math.ceil(estimatedWeeks)} weeks at your pace`;
  } else if (estimatedWeeks < IDEAL_COMPLETION_WEEKS_MIN) {
    // Very short course — still fine, mild bonus reduction only
    score = 0.85;
  } else {
    // Longer than ideal — score decays gradually, never to zero (long
    // courses can still be worth recommending, just ranked lower)
    const overage = estimatedWeeks - IDEAL_COMPLETION_WEEKS_MAX;
    score = Math.max(0.3, 1 - overage / 40);
  }

  return { score, reasons: reason ? [reason] : [] };
}

module.exports = { evaluate };