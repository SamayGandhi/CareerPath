/**
 * defaultTemplate.js
 * -----------------------------------------
 * Generic roadmap stage template, applicable to any career path. Defines
 * the STRUCTURE of a roadmap (how many stages, what each stage's role
 * is) independent of which specific skills/courses populate it — that
 * population happens in roadmap.builder.js using the actual skill gap
 * and recommendation data.
 *
 * Extension point: a career-path-specific template can later be looked
 * up by `careerPath.roadmapTemplateRef` and passed here instead; the
 * builder already accepts a template parameter, so adding path-specific
 * templates requires no change to the builder or sequencer.
 */

const DEFAULT_TEMPLATE = {
  templateRef: 'default-progressive',
  stages: [
    {
      key: 'foundations',
      title: 'Foundations',
      description: 'Build the core prerequisite skills everything else depends on.',
      difficultyFilter: ['beginner'],
      order: 1,
    },
    {
      key: 'core-skills',
      title: 'Core Skills',
      description: 'Develop the primary skills required for your target career path.',
      difficultyFilter: ['beginner', 'intermediate'],
      order: 2,
    },
    {
      key: 'advanced-specialization',
      title: 'Advanced Specialization',
      description: 'Deepen expertise in advanced, specialized areas of your target role.',
      difficultyFilter: ['intermediate', 'advanced'],
      order: 3,
    },
    {
      key: 'interview-readiness',
      title: 'Interview Readiness',
      description: 'Consolidate your skills and prepare to demonstrate them confidently.',
      difficultyFilter: [], // not skill-difficulty-based; always the final stage
      order: 4,
      isTerminalStage: true,
    },
  ],
};

function getDefaultTemplate() {
  return DEFAULT_TEMPLATE;
}

module.exports = { getDefaultTemplate };