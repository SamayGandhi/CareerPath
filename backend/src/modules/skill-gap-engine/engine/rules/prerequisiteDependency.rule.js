/**
 * prerequisiteDependency.rule.js
 * -----------------------------------------
 * RULE: Checks whether the prerequisites of a required skill (per the
 * Skill Taxonomy's dependency graph) are themselves adequately covered
 * by the user's current profile. Flags any prerequisite the user
 * hasn't reached a baseline proficiency in — this directly feeds the
 * Roadmap Engine's sequencing logic in a later phase (skills with
 * unmet prerequisites must be scheduled after those prerequisites).
 */

// Baseline proficiency considered "adequately covered" for a prerequisite,
// independent of what the *target* skill's own required proficiency is —
// a fixed, explainable business constant.
const MIN_PREREQUISITE_PROFICIENCY = 3;

/**
 * @param {object} params
 * @param {{ skillId: import('mongoose').Types.ObjectId }} params.requiredSkill
 * @param {Map<string, { skillId: any, proficiency: number }>} params.userSkillsMap
 * @param {Map<string, { _id: any, prerequisiteSkillIds: any[] }>} params.skillTaxonomyMap
 * @returns {{ missingPrerequisites: string[] }}
 */
function evaluate({ requiredSkill, userSkillsMap, skillTaxonomyMap }) {
  const skillDefinition = skillTaxonomyMap.get(requiredSkill.skillId.toString());

  if (
    !skillDefinition ||
    !skillDefinition.prerequisiteSkillIds ||
    skillDefinition.prerequisiteSkillIds.length === 0
  ) {
    return { missingPrerequisites: [] };
  }

  const missingPrerequisites = skillDefinition.prerequisiteSkillIds
    .filter((prereqId) => {
      const userPrereqSkill = userSkillsMap.get(prereqId.toString());
      return !userPrereqSkill || userPrereqSkill.proficiency < MIN_PREREQUISITE_PROFICIENCY;
    })
    .map((prereqId) => prereqId.toString());

  return { missingPrerequisites };
}

module.exports = { evaluate, MIN_PREREQUISITE_PROFICIENCY };