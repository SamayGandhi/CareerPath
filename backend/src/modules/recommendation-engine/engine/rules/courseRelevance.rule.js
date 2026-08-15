/**
 * courseRelevance.rule.js
 * -----------------------------------------
 * RULE: Scores how well a course's rating/quality signals reflect
 * genuine relevance/quality, independent of price or platform. Uses
 * the course's own rating and rating volume as a confidence-weighted
 * quality signal (a 5.0 rating from 3 reviews is less trustworthy than
 * a 4.6 from 50,000).
 */

const HIGH_CONFIDENCE_RATING_COUNT = 1000;

/**
 * @param {object} params
 * @param {{ rating: number, ratingCount: number }} params.course
 * @returns {{ score: number, reasons: string[] }}
 */
function evaluate({ course }) {
  const rating = course.rating || 0;
  const ratingCount = course.ratingCount || 0;

  // Confidence factor dampens scores from courses with very few ratings,
  // preventing a single 5-star review from outscoring a well-proven course.
  const confidenceFactor = Math.min(ratingCount / HIGH_CONFIDENCE_RATING_COUNT, 1);
  const dampedRating = rating * (0.5 + 0.5 * confidenceFactor);

  const score = Math.max(0, Math.min(1, dampedRating / 5));

  const reasons = [];
  if (rating >= 4.5 && ratingCount >= 1000) {
    reasons.push(`Highly rated (${rating.toFixed(1)}/5 from ${ratingCount.toLocaleString()} learners)`);
  } else if (rating >= 4.0) {
    reasons.push(`Well rated (${rating.toFixed(1)}/5)`);
  }

  return { score, reasons };
}

module.exports = { evaluate };