/**
 * workingProfessional.strategy.js
 * -----------------------------------------
 * STRATEGY: Working professionals have limited time and typically more
 * budget flexibility — time commitment fit and course relevance/quality
 * dominate; they need efficient, high-quality upskilling that respects
 * a busy schedule.
 */

module.exports = {
  userType: 'workingProfessional',
  weights: {
    timeCommitment: 0.3,
    skillGapCoverage: 0.25,
    courseRelevance: 0.2,
    platformReputation: 0.15,
    careerGoalAlignment: 0.05,
    budgetFit: 0.05,
  },
};