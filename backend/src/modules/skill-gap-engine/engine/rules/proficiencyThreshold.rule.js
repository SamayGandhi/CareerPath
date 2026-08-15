/**
 * proficiencyThreshold.rule.js
 * -----------------------------------------
 * RULE: Compares the user's current proficiency against the career
 * path's minimum required proficiency for a skill, and classifies the
 * gap into a fixed, explainable severity tier. Thresholds are fixed
 * business constants — deterministic and auditable, not a black box.
 */

const GAP_SEVERITY = Object.freeze({
  NONE: 'none',
  MINOR: 'minor',
  MODERATE: 'moderate',
  CRITICAL: 'critical',
});

/**
 * @param {object} params
 * @param {{ minProficiency: number }} params.requiredSkill
 * @param {number} params.currentLevel
 * @returns {{ requiredLevel: number, gapAmount: number, gapSeverity: string }}
 */
function evaluate({ requiredSkill, currentLevel }) {
  const requiredLevel = requiredSkill.minProficiency;
  const gapAmount = Math.max(0, requiredLevel - currentLevel);

  let gapSeverity;
  if (gapAmount === 0) {
    gapSeverity = GAP_SEVERITY.NONE;
  } else if (gapAmount >= 3) {
    gapSeverity = GAP_SEVERITY.CRITICAL;
  } else if (gapAmount === 2) {
    gapSeverity = GAP_SEVERITY.MODERATE;
  } else {
    gapSeverity = GAP_SEVERITY.MINOR;
  }

  return { requiredLevel, gapAmount, gapSeverity };
}

module.exports = { evaluate, GAP_SEVERITY };