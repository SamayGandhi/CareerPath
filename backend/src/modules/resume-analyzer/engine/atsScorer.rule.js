/**
 * atsScorer.rule.js
 * -----------------------------------------
 * RULE: Deterministic ATS (Applicant Tracking System) friendliness
 * heuristic. Real ATS systems vary widely, so this is intentionally a
 * transparent, explainable proxy score based on well-documented,
 * broadly-applicable resume-parsing best practices — not a black box.
 * Every point deducted/awarded has a stated reason, matching the
 * platform's transparency-first design principle.
 */

const SECTION_KEYWORDS = {
  contact: [/email/i, /phone/i, /@[\w.-]+\.[a-z]{2,}/i],
  experience: [/experience/i, /employment/i, /work history/i],
  education: [/education/i, /degree/i, /university/i, /college/i],
  skills: [/skills/i, /technical skills/i, /proficienc/i],
};

const MIN_WORD_COUNT = 150;
const MAX_WORD_COUNT = 1200;

/**
 * @param {string} resumeText
 * @param {number} matchedSkillCount - from skillMatcher.rule.js output
 * @returns {{ atsScore: number, breakdown: Array<{ label: string, points: number, maxPoints: number, note: string }> }}
 */
function computeAtsScore(resumeText, matchedSkillCount) {
  const breakdown = [];
  const wordCount = resumeText.trim().split(/\s+/).filter(Boolean).length;

  // 1. Section presence (40 points total, 10 per key section)
  for (const [sectionName, patterns] of Object.entries(SECTION_KEYWORDS)) {
    const found = patterns.some((p) => p.test(resumeText));
    breakdown.push({
      label: `${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)} section detected`,
      points: found ? 10 : 0,
      maxPoints: 10,
      note: found
        ? `Found a clear ${sectionName} section`
        : `No clear ${sectionName} section detected — consider adding one`,
    });
  }

  // 2. Length appropriateness (20 points)
  let lengthPoints;
  let lengthNote;
  if (wordCount < MIN_WORD_COUNT) {
    lengthPoints = 8;
    lengthNote = 'Resume seems short — consider adding more detail on your experience and projects';
  } else if (wordCount > MAX_WORD_COUNT) {
    lengthPoints = 10;
    lengthNote = 'Resume is quite long — consider trimming to the most relevant, recent content';
  } else {
    lengthPoints = 20;
    lengthNote = 'Resume length is well-balanced';
  }
  breakdown.push({ label: 'Appropriate length', points: lengthPoints, maxPoints: 20, note: lengthNote });

  // 3. Skill keyword presence (30 points, scaled by matched skill count)
  const skillPoints = Math.min(30, matchedSkillCount * 3);
  breakdown.push({
    label: 'Recognizable skill keywords',
    points: skillPoints,
    maxPoints: 30,
    note:
      matchedSkillCount > 0
        ? `Detected ${matchedSkillCount} recognizable skill keyword${matchedSkillCount > 1 ? 's' : ''}`
        : 'No recognizable skill keywords detected from our taxonomy',
  });

  // 4. Absence of common parsing hazards (10 points) — heuristic check
  // for excessive special characters/tables that often break ATS parsers.
  const specialCharDensity =
    (resumeText.match(/[^\w\s.,;:()@\-/]/g) || []).length / Math.max(1, resumeText.length);
  const hazardPoints = specialCharDensity < 0.02 ? 10 : 4;
  breakdown.push({
    label: 'ATS-friendly formatting signal',
    points: hazardPoints,
    maxPoints: 10,
    note:
      hazardPoints === 10
        ? 'Text extracted cleanly with minimal special formatting artifacts'
        : 'High density of special characters detected — complex tables/graphics may not parse well in ATS systems',
  });

  const totalPoints = breakdown.reduce((sum, b) => sum + b.points, 0);
  const maxTotalPoints = breakdown.reduce((sum, b) => sum + b.maxPoints, 0);
  const atsScore = Math.round((totalPoints / maxTotalPoints) * 100);

  return { atsScore, breakdown };
}

module.exports = { computeAtsScore };