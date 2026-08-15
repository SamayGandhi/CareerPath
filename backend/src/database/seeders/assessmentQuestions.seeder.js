/**
 * assessmentQuestions.seeder.js
 * -----------------------------------------
 * Seeds an initial set of onboarding assessment questions, linked to
 * skills created by skillTaxonomyAndCareerPaths.seeder.js. Run this
 * AFTER that seeder. Idempotent: skips if any questions already exist
 * for 'initialOnboarding'.
 *
 * Run: node src/database/seeders/assessmentQuestions.seeder.js
 */

require('../../config/env.config');
const mongoose = require('mongoose');
const logger = require('../../config/logger.config');
const { connectDB, disconnectDB } = require('../connection');
const SkillTaxonomy = require('../../modules/skill-taxonomy/skillTaxonomy.model');
const AssessmentQuestionModel = require('../../modules/assessment/assessmentQuestion.model');

const PROFICIENCY_SELECT_OPTIONS = [
  { label: 'I have no experience with this', proficiencyValue: 1 },
  { label: "I've learned the basics", proficiencyValue: 2 },
  { label: 'I can build small things independently', proficiencyValue: 3 },
  { label: 'I can build production-quality work', proficiencyValue: 4 },
  { label: 'I could mentor others in this', proficiencyValue: 5 },
];

const QUESTION_SKILL_NAMES = [
  'HTML',
  'CSS',
  'JavaScript',
  'React',
  'Node.js',
  'Express.js',
  'MongoDB',
  'SQL',
  'Python',
  'Git & Version Control',
  'Communication Skills',
  'Problem Solving',
];

async function seed() {
  await connectDB();
  logger.info('🌱 Starting seed: Assessment Questions...');

  const existingCount = await AssessmentQuestionModel.countDocuments({
    assessmentType: 'initialOnboarding',
  });

  if (existingCount > 0) {
    logger.info('   Assessment questions already seeded, skipping.');
    await disconnectDB();
    process.exit(0);
    return;
  }

  let order = 1;

  for (const skillName of QUESTION_SKILL_NAMES) {
    const skill = await SkillTaxonomy.findOne({
      skillName: { $regex: `^${skillName}$`, $options: 'i' },
    });

    if (!skill) {
      logger.warn(`   ⚠️  Skill not found, skipping question: ${skillName}`);
      continue;
    }

    await AssessmentQuestionModel.create({
      questionText: `How would you rate your current proficiency in ${skillName}?`,
      questionType: 'proficiencySelect',
      skillId: skill._id,
      options: PROFICIENCY_SELECT_OPTIONS,
      assessmentType: 'initialOnboarding',
      order: order++,
      isActive: true,
    });

    logger.info(`   ✅ Created question for skill: ${skillName}`);
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