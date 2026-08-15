/**
 * careerSwitcher.strategy.js
 * -----------------------------------------
 * STRATEGY: Career switchers need maximum credibility (to overcome
 * lack of a traditional background in the new field) and strong
 * alignment with their new target career — this is the profile the
 * platform's core value proposition is most acutely aimed at.
 */

module.exports = {
  userType: 'careerSwitcher',
  weights: {
    careerGoalAlignment: 0.3,
    skillGapCoverage: 0.3,
    platformReputation: 0.2,
    courseRelevance: 0.1,
    timeCommitment: 0.05,
    budgetFit: 0.05,
  },
};