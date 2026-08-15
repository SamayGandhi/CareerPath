/**
 * skillMatcher.rule.js
 * -----------------------------------------
 * RULE: Deterministic keyword/phrase matching of resume text against
 * the Skill Taxonomy — the rule-based core that makes skill extraction
 * work with ZERO AI dependency. Matches are case-insensitive, whole-word
 * (avoids "R" matching inside "Career"), and check both the skill's
 * canonical name and its slug variant.
 *
 * Pure function — takes plain text + a plain skill list, returns plain
 * matched skill data. No I/O.
 */

/**
 * Escapes regex special characters in a skill name before building a
 * word-boundary pattern from it.
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * @param {string} resumeText
 * @param {Array<{ _id: any, skillName: string, slug: string, category: string }>} skillTaxonomyList
 * @returns {Array<{ skillId: any, skillName: string, category: string, matchCount: number }>}
 */
function matchSkills(resumeText, skillTaxonomyList) {
  const normalizedText = resumeText.toLowerCase();
  const matches = [];

  for (const skill of skillTaxonomyList) {
    const candidates = new Set([
      skill.skillName.toLowerCase(),
      skill.slug.toLowerCase().replace(/-/g, ' '),
    ]);

    let matchCount = 0;

    for (const candidate of candidates) {
      if (!candidate) continue;
      const pattern = new RegExp(`\\b${escapeRegex(candidate)}\\b`, 'gi');
      const found = normalizedText.match(pattern);
      if (found) matchCount += found.length;
    }

    if (matchCount > 0) {
      matches.push({
        skillId: skill._id,
        skillName: skill.skillName,
        category: skill.category,
        matchCount,
      });
    }
  }

  // Most-mentioned skills first — a simple, explainable relevance proxy
  return matches.sort((a, b) => b.matchCount - a.matchCount);
}

module.exports = { matchSkills };