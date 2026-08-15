/**
 * skillGapCoverage.rule.js
 * -----------------------------------------
 * RULE: The most important rule — scores a course by how much of the
 * user's identified skill gap it actually closes, weighted by each
 * gap's severity (critical gaps matter more than minor ones) and the
 * career path's importance weight for that skill.
 */

const SEVERITY_WEIGHTS = {
  critical: 1,
  moderate: 0.6,
  minor: 0.3,
  none: 0,
};

/**
 * @param {object} params
 * @param {{ skillsCovered: Array<any> }} params.course
 * @param {Array<{ skillId: any, gapSeverity: string }>} params.gaps
 * @param {Map<string, number>} params.careerPathSkillWeights - skillId -> weight (0-1)
 * @returns {{ score: number, reasons: string[], coveredSkillNames: string[] }}
 */
function evaluate({ course, gaps, careerPathSkillWeights }) {
  const gapMap = new Map(gaps.map((g) => [g.skillId.toString(), g]));

  const courseSkillIds = course.skillsCovered.map((s) =>
    (s._id ? s._id : s).toString()
  );

  let totalPossibleImportance = 0;
  let coveredImportance = 0;
  const coveredSkillNames = [];

  for (const skillId of courseSkillIds) {
    const gap = gapMap.get(skillId);
    if (!gap || gap.gapSeverity === 'none') continue;

    const weight = careerPathSkillWeights.get(skillId) || 0.1;
    const severityFactor = SEVERITY_WEIGHTS[gap.gapSeverity] || 0;
    const importance = weight * severityFactor;

    coveredImportance += importance;
    totalPossibleImportance += weight; // best case: this rule alone can't exceed 1

    const skillName = (course.skillsCovered.find((s) => (s._id || s).toString() === skillId) || {})
      .skillName;
    if (skillName) coveredSkillNames.push(skillName);
  }

  // Normalize against the total weighted importance of ALL current gaps,
  // so a course closing your single biggest critical gap scores highly
  // even if it doesn't touch every other gap.
  const totalGapImportance = gaps.reduce((sum, g) => {
    const weight = careerPathSkillWeights.get(g.skillId.toString()) || 0.1;
    return sum + weight * (SEVERITY_WEIGHTS[g.gapSeverity] || 0);
  }, 0);

  const score = totalGapImportance > 0 ? Math.min(1, coveredImportance / totalGapImportance) : 0;

  const reasons = [];
  if (coveredSkillNames.length > 0) {
    reasons.push(`Directly addresses your skill gap in: ${coveredSkillNames.join(', ')}`);
  }

  return { score, reasons, coveredSkillNames };
}

module.exports = { evaluate, SEVERITY_WEIGHTS };