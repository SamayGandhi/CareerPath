/**
 * schoolStudent.strategy.js
 * -----------------------------------------
 * STRATEGY: School students prioritize budget-friendliness and
 * manageable time commitment heavily; career-goal alignment is nearly
 * irrelevant since most haven't chosen a firm path yet.
 */

module.exports = {
  userType: 'schoolStudent',
  weights: {
    skillGapCoverage: 0.25,
    budgetFit: 0.3,
    timeCommitment: 0.2,
    courseRelevance: 0.15,
    platformReputation: 0.05,
    careerGoalAlignment: 0.05,
  },
};