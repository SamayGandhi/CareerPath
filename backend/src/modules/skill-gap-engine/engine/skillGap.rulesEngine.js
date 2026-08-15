/**
 * skillGap.rulesEngine.js
 * -----------------------------------------
 * Orchestrates the individual rule files against a user's profile and
 * a target career path's required skills, producing a complete,
 * explainable Skill Gap analysis. This is the single entry point the
 * service layer calls — everything below this function is pure logic
 * with zero I/O, zero AI dependency, and 100% deterministic output for
 * a given input (critical for the "works even if AI is unavailable"
 * requirement, and for unit testing).
 */

const requiredSkillsByRoleRule = require('./rules/requiredSkillsByRole.rule');
const proficiencyThresholdRule = require('./rules/proficiencyThreshold.rule');
const prerequisiteDependencyRule = require('./rules/prerequisiteDependency.rule');
const { computeOverallReadinessScore, sortGapsBySeverity } = require('./skillGap.calculator');

/**
 * @param {object} params
 * @param {Array<{ skillId: any, minProficiency: number, weight: number }>} params.requiredSkills
 *   - the target career path's requiredSkills array
 * @param {Array<{ skillId: any, proficiency: number, verified: boolean }>} params.userSkills
 *   - the user's profile.currentSkills array
 * @param {Array<{ _id: any, prerequisiteSkillIds: any[] }>} params.skillTaxonomyList
 *   - full SkillTaxonomy documents for every required skill (for prerequisite lookups)
 *
 * @returns {{
 *   gaps: Array<{
 *     skillId: any,
 *     currentLevel: number,
 *     requiredLevel: number,
 *     gapSeverity: string,
 *     missingPrerequisites: string[]
 *   }>,
 *   overallReadinessScore: number
 * }}
 */
function analyze({ requiredSkills, userSkills, skillTaxonomyList }) {
  const userSkillsMap = new Map(userSkills.map((s) => [s.skillId.toString(), s]));
  const skillTaxonomyMap = new Map(skillTaxonomyList.map((s) => [s._id.toString(), s]));

  const gaps = requiredSkills.map((requiredSkill) => {
    // Rule 1: what does the user currently have?
    const { currentLevel } = requiredSkillsByRoleRule.evaluate({ requiredSkill, userSkillsMap });

    // Rule 2: how big is the gap, and how severe?
    const { requiredLevel, gapSeverity } = proficiencyThresholdRule.evaluate({
      requiredSkill,
      currentLevel,
    });

    // Rule 3: are there unmet prerequisites blocking this skill?
    const { missingPrerequisites } = prerequisiteDependencyRule.evaluate({
      requiredSkill,
      userSkillsMap,
      skillTaxonomyMap,
    });

    return {
      skillId: requiredSkill.skillId,
      currentLevel,
      requiredLevel,
      gapSeverity,
      missingPrerequisites,
    };
  });

  const overallReadinessScore = computeOverallReadinessScore(gaps, requiredSkills);
  const sortedGaps = sortGapsBySeverity(gaps);

  return { gaps: sortedGaps, overallReadinessScore };
}

module.exports = { analyze };