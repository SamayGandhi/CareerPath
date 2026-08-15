/**
 * requiredSkillsByRole.rule.js
 * -----------------------------------------
 * RULE: Determines the user's current proficiency level for a given
 * required skill, defaulting to 0 if the user has no record of it at
 * all (i.e., the skill is completely missing from their profile).
 *
 * Pure function — no side effects, no I/O. Input/output are plain
 * objects only, making this independently unit-testable.
 */

/**
 * @param {object} params
 * @param {{ skillId: import('mongoose').Types.ObjectId, minProficiency: number, weight: number }} params.requiredSkill
 * @param {Map<string, { skillId: any, proficiency: number, verified: boolean }>} params.userSkillsMap
 * @returns {{ currentLevel: number, isVerified: boolean }}
 */
function evaluate({ requiredSkill, userSkillsMap }) {
  const userSkill = userSkillsMap.get(requiredSkill.skillId.toString());

  return {
    currentLevel: userSkill ? userSkill.proficiency : 0,
    isVerified: userSkill ? Boolean(userSkill.verified) : false,
  };
}

module.exports = { evaluate };