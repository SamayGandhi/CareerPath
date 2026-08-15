/**
 * coursesAndPlatforms.seeder.js
 * -----------------------------------------
 * Seeds initial platforms and courses, linked to skills/career paths
 * created by skillTaxonomyAndCareerPaths.seeder.js. Run AFTER that
 * seeder. Idempotent: skips any platform/course that already exists
 * by slug.
 *
 * Run: node src/database/seeders/coursesAndPlatforms.seeder.js
 */

require('../../config/env.config');
const mongoose = require('mongoose');
const logger = require('../../config/logger.config');
const { connectDB, disconnectDB } = require('../connection');
const SkillTaxonomy = require('../../modules/skill-taxonomy/skillTaxonomy.model');
const CareerPath = require('../../modules/career-path/careerPath.model');
const Platform = require('../../modules/platform/platform.model');
const Course = require('../../modules/course/course.model');
const slugify = require('../../shared/utils/slugify.util');

const PLATFORMS = [
  {
    name: 'Udemy',
    pricingModel: 'payPerCourse',
    certificationRecognition: 'medium',
    averageRating: 4.4,
    strengths: ['Huge course variety', 'Frequent discounts', 'Lifetime access'],
    weaknesses: ['Inconsistent quality across instructors', 'No structured learning paths'],
  },
  {
    name: 'Coursera',
    pricingModel: 'subscription',
    certificationRecognition: 'high',
    averageRating: 4.6,
    strengths: ['University-backed content', 'Recognized certifications', 'Structured specializations'],
    weaknesses: ['Higher cost', 'Slower-paced for some learners'],
  },
  {
    name: 'freeCodeCamp',
    pricingModel: 'free',
    certificationRecognition: 'medium',
    averageRating: 4.7,
    strengths: ['Completely free', 'Project-based curriculum', 'Strong community'],
    weaknesses: ['Less hand-holding', 'No official industry certification'],
  },
];

const COURSES = [
  {
    title: 'The Complete JavaScript Course 2026',
    platformName: 'Udemy',
    instructor: 'Jonas Schmedtmann',
    description:
      'A comprehensive, project-based course covering modern JavaScript from fundamentals to advanced asynchronous patterns.',
    skillNames: ['JavaScript', 'HTML', 'CSS'],
    level: 'beginner',
    durationHours: 68,
    price: { amount: 599, currency: 'USD', isFree: false },
    certificationOffered: true,
    rating: 4.7,
    ratingCount: 185000,
    externalUrl: 'https://www.udemy.com/course/the-complete-javascript-course/',
    tags: ['javascript', 'web development', 'frontend'],
    careerPathTitles: ['Frontend Developer'],
    suitableForUserTypes: ['collegeStudent', 'fresher', 'careerSwitcher', 'selfLearner'],
  },
  {
    title: 'React - The Complete Guide',
    platformName: 'Udemy',
    instructor: 'Maximilian Schwarzmüller',
    description:
      'Master React from the ground up, including Hooks, Context API, and Redux, through hands-on projects.',
    skillNames: ['React', 'JavaScript'],
    level: 'intermediate',
    durationHours: 52,
    price: { amount: 699, currency: 'USD', isFree: false },
    certificationOffered: true,
    rating: 4.6,
    ratingCount: 210000,
    externalUrl: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/',
    tags: ['react', 'frontend', 'javascript'],
    careerPathTitles: ['Frontend Developer'],
    suitableForUserTypes: ['collegeStudent', 'fresher', 'careerSwitcher'],
  },
  {
    title: 'Node.js, Express, MongoDB & More: The Complete Bootcamp',
    platformName: 'Udemy',
    instructor: 'Jonas Schmedtmann',
    description:
      'Build real-world backend applications with Node.js, Express, and MongoDB, including authentication and deployment.',
    skillNames: ['Node.js', 'Express.js', 'MongoDB'],
    level: 'intermediate',
    durationHours: 42,
    price: { amount: 649, currency: 'USD', isFree: false },
    certificationOffered: true,
    rating: 4.7,
    ratingCount: 98000,
    externalUrl: 'https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/',
    tags: ['nodejs', 'backend', 'mongodb'],
    careerPathTitles: ['Backend Developer (Node.js)'],
    suitableForUserTypes: ['collegeStudent', 'fresher', 'workingProfessional', 'careerSwitcher'],
  },
  {
    title: 'Responsive Web Design Certification',
    platformName: 'freeCodeCamp',
    instructor: 'freeCodeCamp Team',
    description:
      'Learn HTML and CSS fundamentals through interactive lessons and build five certification projects.',
    skillNames: ['HTML', 'CSS'],
    level: 'beginner',
    durationHours: 15,
    price: { amount: 0, currency: 'USD', isFree: true },
    certificationOffered: true,
    rating: 4.8,
    ratingCount: 45000,
    externalUrl: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/',
    tags: ['html', 'css', 'free'],
    careerPathTitles: ['Frontend Developer'],
    suitableForUserTypes: ['schoolStudent', 'collegeStudent', 'selfLearner'],
  },
  {
    title: 'Python for Everybody Specialization',
    platformName: 'Coursera',
    instructor: 'Dr. Charles Severance',
    description:
      'A beginner-friendly specialization covering Python fundamentals, data structures, and working with databases and APIs.',
    skillNames: ['Python', 'SQL'],
    level: 'beginner',
    durationHours: 32,
    price: { amount: 49, currency: 'USD', isFree: false },
    certificationOffered: true,
    rating: 4.8,
    ratingCount: 132000,
    externalUrl: 'https://www.coursera.org/specializations/python',
    tags: ['python', 'sql', 'data'],
    careerPathTitles: ['Data Analyst'],
    suitableForUserTypes: ['collegeStudent', 'fresher', 'careerSwitcher', 'selfLearner'],
  },
  {
    title: 'IBM Data Analyst Professional Certificate',
    platformName: 'Coursera',
    instructor: 'IBM Skills Network',
    description:
      'Learn data analysis fundamentals including Excel, SQL, Python, and data visualization to launch a career in analytics.',
    skillNames: ['SQL', 'Data Analysis with Python', 'Pandas'],
    level: 'beginner',
    durationHours: 90,
    price: { amount: 59, currency: 'USD', isFree: false },
    certificationOffered: true,
    rating: 4.6,
    ratingCount: 54000,
    externalUrl: 'https://www.coursera.org/professional-certificates/ibm-data-analyst',
    tags: ['data analyst', 'sql', 'python'],
    careerPathTitles: ['Data Analyst'],
    suitableForUserTypes: ['fresher', 'workingProfessional', 'careerSwitcher'],
  },
  {
    title: 'Google UX Design Professional Certificate',
    platformName: 'Coursera',
    instructor: 'Google Career Certificates',
    description:
      'Learn the end-to-end UX design process: research, wireframing, prototyping, and usability testing using Figma.',
    skillNames: ['UI/UX Design Fundamentals', 'Figma'],
    level: 'beginner',
    durationHours: 120,
    price: { amount: 49, currency: 'USD', isFree: false },
    certificationOffered: true,
    rating: 4.7,
    ratingCount: 88000,
    externalUrl: 'https://www.coursera.org/professional-certificates/google-ux-design',
    tags: ['ux design', 'figma', 'design'],
    careerPathTitles: ['UI/UX Designer'],
    suitableForUserTypes: ['schoolStudent', 'collegeStudent', 'fresher', 'careerSwitcher', 'selfLearner'],
  },
];

async function seed() {
  await connectDB();
  logger.info('🌱 Starting seed: Platforms & Courses...');

  const platformNameToId = {};

  for (const p of PLATFORMS) {
    const slug = slugify(p.name);
    let platform = await Platform.findOne({ slug });

    if (platform) {
      logger.info(`   Platform already exists, skipping: ${p.name}`);
    } else {
      platform = await Platform.create({ ...p, slug, isActive: true });
      logger.info(`   ✅ Created platform: ${p.name}`);
    }

    platformNameToId[p.name] = platform._id;
  }

  for (const c of COURSES) {
    const slug = slugify(c.title);
    const exists = await Course.findOne({ slug });

    if (exists) {
      logger.info(`   Course already exists, skipping: ${c.title}`);
      continue;
    }

    const skillDocs = await SkillTaxonomy.find({
      skillName: { $in: c.skillNames },
    });
    const skillsCovered = skillDocs.map((s) => s._id);

    const careerPathDocs = await CareerPath.find({
      title: { $in: c.careerPathTitles || [] },
    });
    const suitableForCareerPathIds = careerPathDocs.map((cp) => cp._id);

    await Course.create({
      title: c.title,
      slug,
      platformId: platformNameToId[c.platformName],
      instructor: c.instructor,
      description: c.description,
      skillsCovered,
      level: c.level,
      durationHours: c.durationHours,
      price: c.price,
      certificationOffered: c.certificationOffered,
      rating: c.rating,
      ratingCount: c.ratingCount,
      externalUrl: c.externalUrl,
      tags: c.tags,
      suitableForCareerPathIds,
      suitableForUserTypes: c.suitableForUserTypes,
      isActive: true,
    });

    logger.info(`   ✅ Created course: ${c.title}`);
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