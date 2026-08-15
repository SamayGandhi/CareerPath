/**
 * careerGoalAlignment.rule.js
 * -----------------------------------------
 * RULE: Scores whether a course is explicitly tagged as suitable for
 * the user's target career path and/or user type — a direct signal
 * layered on top of skill-based relevance.
 */

/**
 * @param {object} params
 * @param {{ suitableForCareerPathIds: any[], suitableForUserTypes: string[] }} params.course
 * @param {string} params.targetCareerPathId
 * @param {string} params.userType
 * @returns {{ score: number, reasons: string[] }}
 */
function evaluate({ course, targetCareerPathId, userType }) {
  const careerPathIds = (course.suitableForCareerPathIds || []).map((id) =>
    (id._id || id).toString()
  );
  const userTypes = course.suitableForUserTypes || [];

  const matchesCareerPath = targetCareerPathId
    ? careerPathIds.includes(targetCareerPathId.toString())
    : false;
  const matchesUserType = userType ? userTypes.includes(userType) : false;

  let score = 0.5; // neutral baseline if no explicit tagging matches
  const reasons = [];

  if (matchesCareerPath && matchesUserType) {
    score = 1;
    reasons.push('Tailored for your career goal and background');
  } else if (matchesCareerPath) {
    score = 0.85;
    reasons.push('Aligned with your target career path');
  } else if (matchesUserType) {
    score = 0.65;
  }

  return { score, reasons };
}

module.exports = { evaluate };