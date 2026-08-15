/**
 * roadmap.sequencer.js
 * -----------------------------------------
 * Pure graph-algorithm layer: performs a topological sort over the
 * skill prerequisite graph (from SkillTaxonomy.prerequisiteSkillIds)
 * restricted to the skills relevant to the current gap analysis. This
 * guarantees, e.g., "SQL Basics" is always sequenced before "Data
 * Analysis with Python + SQL" regardless of which stage-difficulty
 * bucket they'd otherwise fall into.
 *
 * Zero I/O, zero framework dependency — pure computation on plain
 * objects, fully unit-testable in isolation.
 */

/**
 * Performs Kahn's algorithm (BFS-based topological sort) over the
 * subset of skills present in `skillIds`, using each skill's
 * `prerequisiteSkillIds` (filtered to only prerequisites that are ALSO
 * in the relevant skill set — a prerequisite outside the current gap
 * scope, e.g. already mastered, doesn't block sequencing).
 *
 * @param {string[]} skillIds - relevant skill IDs (as strings) to sequence
 * @param {Map<string, { prerequisiteSkillIds: any[] }>} skillTaxonomyMap
 * @returns {{ order: string[], hasCycle: boolean, cyclicSkillIds: string[] }}
 */
function topologicalSort(skillIds, skillTaxonomyMap) {
  const relevantSet = new Set(skillIds);
  const inDegree = new Map(skillIds.map((id) => [id, 0]));
  const adjacency = new Map(skillIds.map((id) => [id, []])); // prereq -> [dependents]

  for (const skillId of skillIds) {
    const definition = skillTaxonomyMap.get(skillId);
    if (!definition) continue;

    const relevantPrereqs = (definition.prerequisiteSkillIds || [])
      .map((id) => id.toString())
      .filter((id) => relevantSet.has(id));

    for (const prereqId of relevantPrereqs) {
      adjacency.get(prereqId).push(skillId);
      inDegree.set(skillId, (inDegree.get(skillId) || 0) + 1);
    }
  }

  // Kahn's algorithm: start with all zero-in-degree nodes
  const queue = skillIds.filter((id) => inDegree.get(id) === 0);
  const order = [];

  while (queue.length > 0) {
    const current = queue.shift();
    order.push(current);

    for (const dependent of adjacency.get(current) || []) {
      inDegree.set(dependent, inDegree.get(dependent) - 1);
      if (inDegree.get(dependent) === 0) {
        queue.push(dependent);
      }
    }
  }

  const hasCycle = order.length !== skillIds.length;
  const cyclicSkillIds = hasCycle
    ? skillIds.filter((id) => !order.includes(id))
    : [];

  // If a cycle is detected (a broken/circular prerequisite graph edge
  // case — should be rare given admin-side validation, but the engine
  // must never crash), fall back to appending the remaining skills in
  // their original order rather than losing them from the roadmap.
  if (hasCycle) {
    for (const id of cyclicSkillIds) {
      if (!order.includes(id)) order.push(id);
    }
  }

  return { order, hasCycle, cyclicSkillIds };
}

module.exports = { topologicalSort };