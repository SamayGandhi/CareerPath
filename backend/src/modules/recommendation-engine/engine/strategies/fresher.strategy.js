/**
 * fresher.strategy.js
 * -----------------------------------------
 * STRATEGY: Freshers (recent graduates entering the job market) need
 * maximum skill-gap closure and strong platform/certification
 * credibility to stand out to employers; budget matters less than for
 * students since they may have some savings or family support.
 */

module.exports = {
  userType: 'fresher',
  weights: {
    skillGapCoverage: 0.35,
    careerGoalAlignment: 0.2,
    platformReputation: 0.2,
    courseRelevance: 0.15,
    timeCommitment: 0.05,
    budgetFit: 0.05,
  },
};