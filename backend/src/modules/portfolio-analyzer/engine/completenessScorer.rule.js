/**
 * completenessScorer.rule.js
 * -----------------------------------------
 * RULE: Deterministic completeness score (0-100) based on section
 * presence, project count, and tech-stack visibility. Fully transparent
 * point allocation, matching the platform's explainability principle.
 */

const SECTION_WEIGHTS = {
  about: 15,
  projects: 30,
  skills: 20,
  experience: 15,
  contact: 20,
};

/**
 * @param {Record<string, boolean>} detectedSections
 * @param {number} projectCount
 * @param {string[]} techStackDetected
 * @returns {{ completenessScore: number, breakdown: Array<{ label: string, points: number, maxPoints: number, note: string }> }}
 */
function computeCompletenessScore(detectedSections, projectCount, techStackDetected) {
  const breakdown = [];

  for (const [sectionName, weight] of Object.entries(SECTION_WEIGHTS)) {
    const present = Boolean(detectedSections[sectionName]);
    breakdown.push({
      label: `${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)} section`,
      points: present ? weight : 0,
      maxPoints: weight,
      note: present
        ? `${sectionName} section detected`
        : `No clear ${sectionName} section detected — consider adding one`,
    });
  }

  const sectionTotal = breakdown.reduce((sum, b) => sum + b.points, 0);
  const sectionMax = breakdown.reduce((sum, b) => sum + b.maxPoints, 0);

  // Bonus signals (not part of the weighted section total, added on top,
  // capped so they can't push the score past 100)
  let bonusPoints = 0;
  const bonusNotes = [];

  if (projectCount >= 3) {
    bonusPoints += 5;
    bonusNotes.push(`${projectCount} project entries detected`);
  } else if (projectCount > 0) {
    bonusNotes.push(`Only ${projectCount} project entr${projectCount === 1 ? 'y' : 'ies'} detected — consider showcasing more`);
  }

  if (techStackDetected.length >= 3) {
    bonusPoints += 5;
    bonusNotes.push(`${techStackDetected.length} recognizable technologies mentioned`);
  }

  const rawScore = ((sectionTotal / sectionMax) * 90) + bonusPoints; // sections worth 90%, bonuses up to 10%
  const completenessScore = Math.round(Math.max(0, Math.min(100, rawScore)));

  return { completenessScore, breakdown, bonusNotes };
}

module.exports = { computeCompletenessScore, SECTION_WEIGHTS };