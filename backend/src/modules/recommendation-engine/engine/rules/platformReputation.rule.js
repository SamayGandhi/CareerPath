/**
 * platformReputation.rule.js
 * -----------------------------------------
 * RULE: Scores a course based on its hosting platform's reputation
 * signals — average rating and certification recognition level.
 */

const CERTIFICATION_RECOGNITION_SCORES = {
  high: 1,
  medium: 0.6,
  low: 0.3,
};

/**
 * @param {object} params
 * @param {{ averageRating: number, certificationRecognition: string }} params.platform
 * @returns {{ score: number, reasons: string[] }}
 */
function evaluate({ platform }) {
  if (!platform) {
    return { score: 0.5, reasons: [] };
  }

  const ratingScore = Math.max(0, Math.min(1, (platform.averageRating || 0) / 5));
  const certScore = CERTIFICATION_RECOGNITION_SCORES[platform.certificationRecognition] ?? 0.5;

  const score = ratingScore * 0.6 + certScore * 0.4;

  const reasons = [];
  if (platform.certificationRecognition === 'high') {
    reasons.push(`${platform.name} certifications are widely recognized by employers`);
  }

  return { score, reasons };
}

module.exports = { evaluate };