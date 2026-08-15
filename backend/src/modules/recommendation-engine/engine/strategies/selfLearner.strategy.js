/**
 * selfLearner.strategy.js
 * -----------------------------------------
 * STRATEGY: Self-learners are typically budget-conscious and motivated
 * by genuine skill acquisition over credentials — skill-gap coverage
 * and course quality/relevance matter most; platform prestige matters
 * least since they aren't optimizing for a resume line.
 */

module.exports = {
  userType: 'selfLearner',
  weights: {
    skillGapCoverage: 0.3,
    courseRelevance: 0.25,
    budgetFit: 0.25,
    timeCommitment: 0.1,
    careerGoalAlignment: 0.05,
    platformReputation: 0.05,
  },
};