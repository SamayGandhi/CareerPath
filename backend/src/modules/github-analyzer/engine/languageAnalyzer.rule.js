/**
 * languageAnalyzer.rule.js
 * -----------------------------------------
 * RULE: Aggregates per-repo language byte-counts (from GitHub's
 * languages API) into an overall language distribution, and maps
 * detected languages to Skill Taxonomy entries where a name match
 * exists — a deterministic, explainable inference step, not AI.
 *
 * Pure function — takes plain data in, returns plain data out.
 */

/**
 * @param {Array<Record<string, number>>} perRepoLanguages - one object per repo, { languageName: byteCount }
 * @param {Array<{ _id: any, skillName: string }>} skillTaxonomyList
 * @returns {{
 *   languageDistribution: Array<{ language: string, bytes: number, percentage: number }>,
 *   inferredSkills: Array<{ skillId: any, skillName: string }>
 * }}
 */
function analyzeLanguages(perRepoLanguages, skillTaxonomyList) {
  const totals = new Map();

  for (const repoLangs of perRepoLanguages) {
    for (const [language, bytes] of Object.entries(repoLangs)) {
      totals.set(language, (totals.get(language) || 0) + bytes);
    }
  }

  const grandTotal = Array.from(totals.values()).reduce((sum, b) => sum + b, 0);

  const languageDistribution = Array.from(totals.entries())
    .map(([language, bytes]) => ({
      language,
      bytes,
      percentage: grandTotal > 0 ? Math.round((bytes / grandTotal) * 100) : 0,
    }))
    .sort((a, b) => b.bytes - a.bytes);

  // Deterministic name-based mapping: a detected language matches a
  // taxonomy skill if the skill's name equals the language name
  // (case-insensitive) — e.g. GitHub language "JavaScript" -> skill
  // "JavaScript". This intentionally does NOT guess synonyms/frameworks
  // (e.g. "TypeScript" repos don't imply a "React" skill) — that kind
  // of inference is exactly the sort of judgment call reserved for the
  // future AI enhancement layer, not this rule-based core.
  const skillByLowerName = new Map(
    skillTaxonomyList.map((s) => [s.skillName.toLowerCase(), s])
  );

  const inferredSkills = [];
  for (const { language } of languageDistribution) {
    const matchedSkill = skillByLowerName.get(language.toLowerCase());
    if (matchedSkill) {
      inferredSkills.push({ skillId: matchedSkill._id, skillName: matchedSkill.skillName });
    }
  }

  return { languageDistribution, inferredSkills };
}

module.exports = { analyzeLanguages };