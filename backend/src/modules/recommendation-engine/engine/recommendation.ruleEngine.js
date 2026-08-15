/**
 * recommendation.ruleEngine.js
 * -----------------------------------------
 * Orchestrates all 6 rules against every candidate course, using the
 * strategy selected for the user's type, and returns a ranked, scored,
 * fully-explainable list. Zero AI dependency, zero I/O — pure logic
 * operating on plain objects passed in by the service layer.
 */

const courseRelevanceRule = require('./rules/courseRelevance.rule');
const budgetFitRule = require('./rules/budgetFit.rule');
const platformReputationRule = require('./rules/platformReputation.rule');
const skillGapCoverageRule = require('./rules/skillGapCoverage.rule');
const timeCommitmentRule = require('./rules/timeCommitment.rule');
const careerGoalAlignmentRule = require('./rules/careerGoalAlignment.rule');
const { getStrategyForUserType } = require('./strategies/strategy.registry');
const { computeWeightedScore } = require('./recommendation.scorer');

/**
 * @param {object} params
 * @param {Array<object>} params.candidateCourses - populated Course docs (with platformId, skillsCovered populated)
 * @param {Array<{ skillId: any, gapSeverity: string }>} params.gaps
 * @param {Map<string, number>} params.careerPathSkillWeights
 * @param {string} params.userType
 * @param {string} params.budgetPreference
 * @param {number} params.weeklyTimeCommitmentHours
 * @param {string} params.targetCareerPathId
 * @param {number} [params.topN=10]
 *
 * @returns {{
 *   strategyUsed: string,
 *   recommendedCourses: Array<{
 *     courseId: any, score: number, reasons: string[],
 *     ruleBreakdown: Array<{ ruleName: string, contribution: number }>
 *   }>
 * }}
 */
function generateRecommendations({
  candidateCourses,
  gaps,
  careerPathSkillWeights,
  userType,
  budgetPreference,
  weeklyTimeCommitmentHours,
  targetCareerPathId,
  topN = 10,
}) {
  const strategy = getStrategyForUserType(userType);

  const scoredCourses = candidateCourses.map((course) => {
    const ruleResults = {
      courseRelevance: courseRelevanceRule.evaluate({ course }),
      budgetFit: budgetFitRule.evaluate({ course, budgetPreference }),
      platformReputation: platformReputationRule.evaluate({ platform: course.platformId }),
      skillGapCoverage: skillGapCoverageRule.evaluate({ course, gaps, careerPathSkillWeights }),
      timeCommitment: timeCommitmentRule.evaluate({ course, weeklyTimeCommitmentHours }),
      careerGoalAlignment: careerGoalAlignmentRule.evaluate({
        course,
        targetCareerPathId,
        userType,
      }),
    };

    const { score, reasons, ruleBreakdown } = computeWeightedScore(ruleResults, strategy.weights);

    return {
      courseId: course._id,
      score,
      reasons: [...new Set(reasons)], // de-duplicate identical reason strings
      ruleBreakdown,
    };
  });

  // Only recommend courses that address at least SOME skill gap — a
  // course scoring purely on budget/reputation with zero gap coverage
  // isn't a meaningful recommendation for this engine's purpose.
  const relevantCourses = scoredCourses.filter((c) => {
    const breakdown = c.ruleBreakdown.find((r) => r.ruleName === 'skillGapCoverage');
    return breakdown && breakdown.contribution > 0;
  });

  const rankedCourses = (relevantCourses.length > 0 ? relevantCourses : scoredCourses)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  return {
    strategyUsed: `${strategy.userType}Strategy`,
    recommendedCourses: rankedCourses,
  };
}

module.exports = { generateRecommendations };