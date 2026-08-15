/**
 * skillTaxonomyAndCareerPaths.seeder.js
 * -----------------------------------------
 * Seeds initial reference data so the platform is testable end-to-end
 * without manually creating skills/career paths via the admin API first.
 * Run manually: node src/database/seeders/skillTaxonomyAndCareerPaths.seeder.js
 * Idempotent: skips any skill/career path that already exists by slug.
 */

require('../../config/env.config');
const mongoose = require('mongoose');
const logger = require('../../config/logger.config');
const { connectDB, disconnectDB } = require('../connection');
const SkillTaxonomy = require('../../modules/skill-taxonomy/skillTaxonomy.model');
const CareerPath = require('../../modules/career-path/careerPath.model');
const slugify = require('../../shared/utils/slugify.util');

const SKILLS = [
  { skillName: 'HTML', category: 'programming', difficultyLevel: 'beginner' },
  { skillName: 'CSS', category: 'programming', difficultyLevel: 'beginner' },
  { skillName: 'JavaScript', category: 'programming', difficultyLevel: 'beginner', prereqs: ['HTML', 'CSS'] },
  { skillName: 'React', category: 'programming', difficultyLevel: 'intermediate', prereqs: ['JavaScript'] },
  { skillName: 'Node.js', category: 'programming', difficultyLevel: 'intermediate', prereqs: ['JavaScript'] },
  { skillName: 'Express.js', category: 'programming', difficultyLevel: 'intermediate', prereqs: ['Node.js'] },
  { skillName: 'MongoDB', category: 'tool', difficultyLevel: 'intermediate' },
  { skillName: 'SQL', category: 'dataScience', difficultyLevel: 'beginner' },
  { skillName: 'Python', category: 'programming', difficultyLevel: 'beginner' },
  { skillName: 'Data Analysis with Python', category: 'dataScience', difficultyLevel: 'intermediate', prereqs: ['Python', 'SQL'] },
  { skillName: 'Pandas', category: 'dataScience', difficultyLevel: 'intermediate', prereqs: ['Python'] },
  { skillName: 'Machine Learning Fundamentals', category: 'dataScience', difficultyLevel: 'advanced', prereqs: ['Data Analysis with Python'] },
  { skillName: 'Git & Version Control', category: 'tool', difficultyLevel: 'beginner' },
  { skillName: 'REST API Design', category: 'programming', difficultyLevel: 'intermediate', prereqs: ['Express.js'] },
  { skillName: 'UI/UX Design Fundamentals', category: 'design', difficultyLevel: 'beginner' },
  { skillName: 'Figma', category: 'tool', difficultyLevel: 'beginner' },
  { skillName: 'Communication Skills', category: 'softSkill', difficultyLevel: 'beginner' },
  { skillName: 'Problem Solving', category: 'softSkill', difficultyLevel: 'beginner' },
];

const CAREER_PATHS = [
  {
    title: 'Frontend Developer',
    description:
      'Build modern, responsive user interfaces using HTML, CSS, JavaScript and component-based frameworks like React.',
    industry: 'IT',
    growthOutlook: 'high',
    suitableForUserTypes: ['collegeStudent', 'fresher', 'careerSwitcher', 'selfLearner'],
    requiredSkillsSpec: [
      { skillName: 'HTML', minProficiency: 4, weight: 0.1 },
      { skillName: 'CSS', minProficiency: 4, weight: 0.15 },
      { skillName: 'JavaScript', minProficiency: 4, weight: 0.25 },
      { skillName: 'React', minProficiency: 3, weight: 0.3 },
      { skillName: 'Git & Version Control', minProficiency: 3, weight: 0.1 },
      { skillName: 'Problem Solving', minProficiency: 3, weight: 0.1 },
    ],
  },
  {
    title: 'Backend Developer (Node.js)',
    description:
      'Design and build scalable server-side applications, REST APIs, and database-driven systems using Node.js and Express.',
    industry: 'IT',
    growthOutlook: 'high',
    suitableForUserTypes: ['collegeStudent', 'fresher', 'workingProfessional', 'careerSwitcher'],
    requiredSkillsSpec: [
      { skillName: 'JavaScript', minProficiency: 4, weight: 0.2 },
      { skillName: 'Node.js', minProficiency: 4, weight: 0.25 },
      { skillName: 'Express.js', minProficiency: 3, weight: 0.2 },
      { skillName: 'MongoDB', minProficiency: 3, weight: 0.15 },
      { skillName: 'REST API Design', minProficiency: 3, weight: 0.1 },
      { skillName: 'Git & Version Control', minProficiency: 3, weight: 0.1 },
    ],
  },
  {
    title: 'Data Analyst',
    description:
      'Analyze structured data to uncover trends and insights using SQL, Python, and data visualization techniques.',
    industry: 'Analytics',
    growthOutlook: 'high',
    suitableForUserTypes: ['collegeStudent', 'fresher', 'workingProfessional', 'careerSwitcher', 'selfLearner'],
    requiredSkillsSpec: [
      { skillName: 'SQL', minProficiency: 4, weight: 0.25 },
      { skillName: 'Python', minProficiency: 3, weight: 0.2 },
      { skillName: 'Data Analysis with Python', minProficiency: 3, weight: 0.25 },
      { skillName: 'Pandas', minProficiency: 3, weight: 0.15 },
      { skillName: 'Communication Skills', minProficiency: 3, weight: 0.15 },
    ],
  },
  {
    title: 'UI/UX Designer',
    description:
      'Design intuitive, user-centered digital experiences using research, wireframing, prototyping, and visual design tools.',
    industry: 'Design',
    growthOutlook: 'medium',
    suitableForUserTypes: ['schoolStudent', 'collegeStudent', 'fresher', 'careerSwitcher', 'selfLearner'],
    requiredSkillsSpec: [
      { skillName: 'UI/UX Design Fundamentals', minProficiency: 4, weight: 0.4 },
      { skillName: 'Figma', minProficiency: 4, weight: 0.35 },
      { skillName: 'Communication Skills', minProficiency: 3, weight: 0.25 },
    ],
  },
];

async function seed() {
  await connectDB();
  logger.info('🌱 Starting seed: Skill Taxonomy & Career Paths...');

  const skillNameToId = {};

  // ---- Seed Skills (order matters: prereqs must exist before being referenced) ----
  for (const skillDef of SKILLS) {
    const slug = slugify(skillDef.skillName);
    let skill = await SkillTaxonomy.findOne({ slug });

    if (skill) {
      logger.info(`   Skill already exists, skipping: ${skillDef.skillName}`);
    } else {
      const prerequisiteSkillIds = (skillDef.prereqs || [])
        .map((name) => skillNameToId[name])
        .filter(Boolean);

      skill = await SkillTaxonomy.create({
        skillName: skillDef.skillName,
        slug,
        category: skillDef.category,
        difficultyLevel: skillDef.difficultyLevel,
        prerequisiteSkillIds,
        isActive: true,
      });
      logger.info(`   ✅ Created skill: ${skillDef.skillName}`);
    }

    skillNameToId[skillDef.skillName] = skill._id;
  }

  // ---- Seed Career Paths ----
  for (const cp of CAREER_PATHS) {
    const slug = slugify(cp.title);
    const exists = await CareerPath.findOne({ slug });

    if (exists) {
      logger.info(`   Career path already exists, skipping: ${cp.title}`);
      continue;
    }

    const requiredSkills = cp.requiredSkillsSpec.map((spec) => ({
      skillId: skillNameToId[spec.skillName],
      minProficiency: spec.minProficiency,
      weight: spec.weight,
    }));

    await CareerPath.create({
      title: cp.title,
      slug,
      description: cp.description,
      industry: cp.industry,
      growthOutlook: cp.growthOutlook,
      suitableForUserTypes: cp.suitableForUserTypes,
      requiredSkills,
      isActive: true,
    });

    logger.info(`   ✅ Created career path: ${cp.title}`);
  }

  logger.info('🌱 Seed complete.');
  await disconnectDB();
  process.exit(0);
}

seed().catch((error) => {
  logger.error(`Seed failed: ${error.message}`, { stack: error.stack });
  mongoose.disconnect();
  process.exit(1);
});