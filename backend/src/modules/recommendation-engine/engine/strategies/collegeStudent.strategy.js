/**
 * collegeStudent.strategy.js
 * -----------------------------------------
 * STRATEGY: College students balance skill-gap closure with budget
 * sensitivity, and career alignment starts to matter as they approach
 * placements.
 */

module.exports = {
  userType: 'collegeStudent',
  weights: {
    skillGapCoverage: 0.3,
    budgetFit: 0.2,
    timeCommitment: 0.15,
    courseRelevance: 0.15,
    platformReputation: 0.1,
    careerGoalAlignment: 0.1,
  },
};