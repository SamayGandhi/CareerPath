/**
 * roadmap.builder.js
 * -----------------------------------------
 * Merges 3 inputs — Skill Gap Report + Recommendation + a Roadmap
 * Template — into a sequenced, staged roadmap. Uses the sequencer's
 * topological sort to guarantee prerequisite ordering, then buckets
 * skills into template stages by difficulty, and attaches the
 * best-matching recommended courses to each stage.
 *
 * FIXED: the input `gaps` array's `skillId` field may arrive either as
 * a raw ObjectId/string OR as a POPULATED Mongoose sub-document
 * (skillGapReportRepository.findById() populates gaps.skillId with
 * skillName/slug/category/difficultyLevel for display purposes
 * elsewhere in the app). The previous code called `.toString()`
 * directly on this value, which produced an invalid, non-hex string
 * whenever it was a populated document — causing a Mongoose CastError
 * on save. Now normalized to extract `._id` first when present,
 * matching the same defensive pattern already used below for
 * `course.skillsCovered`.
 *
 * Pure logic, zero I/O — operates entirely on plain objects passed in
 * by the service layer.
 */

const { topologicalSort } = require('./roadmap.sequencer');

const HOURS_PER_SKILL_ESTIMATE = 15;
const DEFAULT_WEEKLY_HOURS_FALLBACK = 5;

/**
 * Normalizes a skillId reference to its plain hex ObjectId string,
 * regardless of whether it arrived as a raw ObjectId/string or as a
 * populated Mongoose sub-document containing an `_id` field.
 */
function normalizeSkillIdToString(skillIdRef) {
  const raw = skillIdRef && skillIdRef._id ? skillIdRef._id : skillIdRef;
  return raw.toString();
}

function buildRoadmap({
  gaps,
  skillTaxonomyMap,
  recommendedCourses,
  courseSkillsMap,
  template,
  weeklyTimeCommitmentHours,
}) {
  const relevantGaps = gaps.filter((g) => g.gapSeverity !== 'none');
  const skillIds = relevantGaps.map((g) => normalizeSkillIdToString(g.skillId));

  // Step 1: topological sort guarantees prerequisite-safe ordering
  const { order: sequencedSkillIds } = topologicalSort(skillIds, skillTaxonomyMap);

  // Step 2: bucket sequenced skills into template stages by difficulty,
  // preserving the topological order WITHIN each bucket.
  const nonTerminalStages = template.stages.filter((s) => !s.isTerminalStage);
  const terminalStage = template.stages.find((s) => s.isTerminalStage);

  const stageSkillBuckets = nonTerminalStages.map(() => []);
  const bucketedSkillIds = new Set();

  for (const skillId of sequencedSkillIds) {
    const definition = skillTaxonomyMap.get(skillId);
    const difficulty = definition?.difficultyLevel || 'beginner';

    const stageIndex = nonTerminalStages.findIndex((s) => s.difficultyFilter.includes(difficulty));
    const targetIndex = stageIndex >= 0 ? stageIndex : nonTerminalStages.length - 1;

    stageSkillBuckets[targetIndex].push(skillId);
    bucketedSkillIds.add(skillId);
  }

  // Step 3: attach best-matching recommended courses to each stage
  // (a course is attached to a stage if it covers at least one skill
  // assigned to that stage).
  const weeklyHours = weeklyTimeCommitmentHours || DEFAULT_WEEKLY_HOURS_FALLBACK;

  const stages = nonTerminalStages.map((stageTemplate, index) => {
    const stageSkillIds = stageSkillBuckets[index];
    if (stageSkillIds.length === 0) return null; // omit empty stages entirely

    const stageSkillSet = new Set(stageSkillIds);
    const linkedCourseIds = recommendedCourses
      .filter((rc) => {
        const courseSkills = courseSkillsMap.get(rc.courseId.toString()) || [];
        return courseSkills.some((sId) => stageSkillSet.has(sId.toString()));
      })
      .map((rc) => rc.courseId);

    const estimatedDurationWeeks = Math.max(
      1,
      Math.ceil((stageSkillIds.length * HOURS_PER_SKILL_ESTIMATE) / weeklyHours)
    );

    return {
      stageId: stageTemplate.key,
      title: stageTemplate.title,
      order: stageTemplate.order,
      estimatedDurationWeeks,
      linkedCourseIds,
      linkedSkillIds: stageSkillIds,
      status: index === 0 ? 'unlocked' : 'locked',
      unlockCondition: index === 0 ? 'none' : 'previousStageComplete',
    };
  }).filter(Boolean);

  // Step 4: always append the terminal (Interview Readiness) stage,
  // locked behind all skill-building stages, with no linked skills of
  // its own (it consumes the Interview Prep module built in a later phase).
  if (terminalStage) {
    stages.push({
      stageId: terminalStage.key,
      title: terminalStage.title,
      order: terminalStage.order,
      estimatedDurationWeeks: 2,
      linkedCourseIds: [],
      linkedSkillIds: [],
      status: 'locked',
      unlockCondition: 'previousStageComplete',
    });
  }

  const estimatedTotalDurationWeeks = stages.reduce((sum, s) => sum + s.estimatedDurationWeeks, 0);

  return { stages, estimatedTotalDurationWeeks };
}

module.exports = { buildRoadmap };