/**
 * interviewQuestions.seeder.js
 * -----------------------------------------
 * Seeds MCQ interview questions linked to skills and career paths.
 * UPDATED (Batch 5.3 — Interview Prep improvements): now idempotent
 * PER QUESTION (checks each question's text individually) instead of
 * skipping the entire seeder if ANY question already exists. This
 * makes it safe to re-run after adding new questions to this file —
 * previously seeded questions are left untouched, only genuinely new
 * ones are inserted.
 *
 * Also expanded with additional practical, beginner/intermediate
 * questions for the career paths already seeded elsewhere in the
 * platform (Frontend Developer, Backend Developer (Node.js), Data
 * Analyst, UI/UX Designer) — directly increases the random-selection
 * pool size, reducing how often the same question reappears across
 * mock test attempts. New career paths were deliberately NOT
 * introduced here, since that would require corresponding
 * skillTaxonomy/careerPaths seed changes and could affect the
 * Recommendation/Skill Gap engines' existing data dependencies —
 * out of scope for this UX-focused batch. Further career-specific
 * expansion (e.g. DevOps, Cloud, ML, Cyber Security) is fully
 * supported without any code change via the Admin Panel's Question
 * Bank tab once those career paths/skills exist in the taxonomy.
 *
 * Run: node src/database/seeders/interviewQuestions.seeder.js
 */

require('../../config/env.config');
const mongoose = require('mongoose');
const logger = require('../../config/logger.config');
const { connectDB, disconnectDB } = require('../connection');
const SkillTaxonomy = require('../../modules/skill-taxonomy/skillTaxonomy.model');
const CareerPath = require('../../modules/career-path/careerPath.model');
const InterviewQuestion = require('../../modules/interview-prep/interviewQuestion.model');

const QUESTIONS = [
  // ---- Previously seeded (unchanged content, kept for continuity) ----
  {
    questionText: 'Which HTML tag is used to define an unordered list?',
    questionType: 'mcq',
    options: ['<ol>', '<ul>', '<list>', '<li>'],
    correctAnswer: '<ul>',
    explanation: 'The <ul> tag defines an unordered (bulleted) list, while <ol> defines an ordered (numbered) list.',
    skillNames: ['HTML'],
    careerPathTitles: ['Frontend Developer'],
    difficultyLevel: 'easy',
  },
  {
    questionText: 'Which CSS property is used to control the spacing between flex items?',
    questionType: 'mcq',
    options: ['margin', 'gap', 'padding', 'spacing'],
    correctAnswer: 'gap',
    explanation: 'The `gap` property (or `row-gap`/`column-gap`) controls spacing between flex or grid items directly.',
    skillNames: ['CSS'],
    careerPathTitles: ['Frontend Developer'],
    difficultyLevel: 'medium',
  },
  {
    questionText: 'What does the "this" keyword refer to inside a regular JavaScript function called as a method?',
    questionType: 'mcq',
    options: [
      'The global object always',
      'The object the method was called on',
      'undefined always',
      'The function itself',
    ],
    correctAnswer: 'The object the method was called on',
    explanation: 'In a regular (non-arrow) function called as a method, `this` refers to the object the method was invoked on.',
    skillNames: ['JavaScript'],
    careerPathTitles: ['Frontend Developer', 'Backend Developer (Node.js)'],
    difficultyLevel: 'medium',
  },
  {
    questionText: 'What is the purpose of the useEffect hook in React?',
    questionType: 'mcq',
    options: [
      'To define component state',
      'To perform side effects after render',
      'To create a new component',
      'To style a component',
    ],
    correctAnswer: 'To perform side effects after render',
    explanation: 'useEffect lets you perform side effects (data fetching, subscriptions, manual DOM changes) after the component renders.',
    skillNames: ['React'],
    careerPathTitles: ['Frontend Developer'],
    difficultyLevel: 'medium',
  },
  {
    questionText: 'Which of the following is true about middleware in Express.js?',
    questionType: 'mcq',
    options: [
      'Middleware functions cannot access the request object',
      'Middleware functions execute in the order they are registered',
      'Only one middleware function can be used per route',
      'Middleware functions cannot call next()',
    ],
    correctAnswer: 'Middleware functions execute in the order they are registered',
    explanation: 'Express middleware executes sequentially in registration order, and each must call next() to pass control onward.',
    skillNames: ['Express.js'],
    careerPathTitles: ['Backend Developer (Node.js)'],
    difficultyLevel: 'medium',
  },
  {
    questionText: 'Which MongoDB operator is used to select documents where a field value is greater than a specified value?',
    questionType: 'mcq',
    options: ['$eq', '$gt', '$in', '$lt'],
    correctAnswer: '$gt',
    explanation: '$gt selects documents where the field value is greater than the specified value.',
    skillNames: ['MongoDB'],
    careerPathTitles: ['Backend Developer (Node.js)'],
    difficultyLevel: 'easy',
  },
  {
    questionText: 'Which SQL clause is used to filter groups after a GROUP BY aggregation?',
    questionType: 'mcq',
    options: ['WHERE', 'HAVING', 'FILTER', 'ORDER BY'],
    correctAnswer: 'HAVING',
    explanation: 'HAVING filters aggregated group results, while WHERE filters rows before grouping occurs.',
    skillNames: ['SQL'],
    careerPathTitles: ['Data Analyst'],
    difficultyLevel: 'medium',
  },
  {
    questionText: 'In Pandas, which method is used to handle missing values by removing rows containing them?',
    questionType: 'mcq',
    options: ['fillna()', 'dropna()', 'isnull()', 'remove()'],
    correctAnswer: 'dropna()',
    explanation: 'dropna() removes rows (or columns) containing missing (NaN) values, while fillna() replaces them.',
    skillNames: ['Pandas'],
    careerPathTitles: ['Data Analyst'],
    difficultyLevel: 'easy',
  },
  {
    questionText: 'What is the primary goal of a usability testing session in the UX design process?',
    questionType: 'mcq',
    options: [
      'To finalize visual branding',
      'To observe real users interacting with a design and identify friction points',
      'To write marketing copy',
      'To choose a color palette',
    ],
    correctAnswer: 'To observe real users interacting with a design and identify friction points',
    explanation: 'Usability testing observes real users completing tasks to uncover usability issues before or after launch.',
    skillNames: ['UI/UX Design Fundamentals'],
    careerPathTitles: ['UI/UX Designer'],
    difficultyLevel: 'easy',
  },
  {
    questionText: 'In Figma, what is the primary purpose of using "Components"?',
    questionType: 'mcq',
    options: [
      'To export files as PDF',
      'To create reusable, synchronized design elements',
      'To add animations only',
      'To manage team billing',
    ],
    correctAnswer: 'To create reusable, synchronized design elements',
    explanation: 'Components let designers create reusable elements; instances stay in sync with the main component when updated.',
    skillNames: ['Figma'],
    careerPathTitles: ['UI/UX Designer'],
    difficultyLevel: 'medium',
  },

  // ---- NEW (Batch 5.3): additional Frontend Developer questions ----
  {
    questionText: 'Which value of the CSS `position` property removes an element from normal document flow and positions it relative to its nearest positioned ancestor?',
    questionType: 'mcq',
    options: ['static', 'relative', 'absolute', 'sticky'],
    correctAnswer: 'absolute',
    explanation: 'position: absolute removes the element from normal flow and positions it relative to the nearest ancestor with a non-static position.',
    skillNames: ['CSS'],
    careerPathTitles: ['Frontend Developer'],
    difficultyLevel: 'easy',
  },
  {
    questionText: 'What is the main difference between `let` and `var` in JavaScript?',
    questionType: 'mcq',
    options: [
      '`let` is function-scoped, `var` is block-scoped',
      '`let` is block-scoped, `var` is function-scoped',
      'There is no difference',
      '`var` cannot be reassigned',
    ],
    correctAnswer: '`let` is block-scoped, `var` is function-scoped',
    explanation: '`let` respects block scope (e.g. inside an if or for block), while `var` is scoped to the enclosing function.',
    skillNames: ['JavaScript'],
    careerPathTitles: ['Frontend Developer'],
    difficultyLevel: 'easy',
  },
  {
    questionText: 'In React, what is the purpose of a "key" prop when rendering a list of elements?',
    questionType: 'mcq',
    options: [
      'To style each item uniquely',
      'To help React identify which items changed, were added, or were removed',
      'To sort the list automatically',
      'To make the list read-only',
    ],
    correctAnswer: 'To help React identify which items changed, were added, or were removed',
    explanation: 'Keys give React a stable identity for each list item across renders, enabling efficient reconciliation.',
    skillNames: ['React'],
    careerPathTitles: ['Frontend Developer'],
    difficultyLevel: 'medium',
  },

  // ---- NEW (Batch 5.3): additional Backend Developer (Node.js) questions ----
  {
    questionText: 'What does the Node.js Event Loop primarily enable?',
    questionType: 'mcq',
    options: [
      'Multi-threaded parallel execution of JavaScript',
      'Non-blocking I/O despite JavaScript being single-threaded',
      'Automatic memory management only',
      'Direct access to the file system without callbacks',
    ],
    correctAnswer: 'Non-blocking I/O despite JavaScript being single-threaded',
    explanation: 'The event loop allows Node.js to perform non-blocking I/O operations by offloading them and handling callbacks when ready, despite JavaScript itself being single-threaded.',
    skillNames: ['Node.js'],
    careerPathTitles: ['Backend Developer (Node.js)'],
    difficultyLevel: 'medium',
  },
  {
    questionText: 'Which HTTP status code should a REST API return when a resource is successfully created?',
    questionType: 'mcq',
    options: ['200', '201', '204', '301'],
    correctAnswer: '201',
    explanation: '201 Created indicates the request succeeded and a new resource was created as a result.',
    skillNames: ['REST API Design'],
    careerPathTitles: ['Backend Developer (Node.js)'],
    difficultyLevel: 'easy',
  },
  {
    questionText: 'In MongoDB/Mongoose, what is the purpose of an index on a field?',
    questionType: 'mcq',
    options: [
      'To enforce a default value',
      'To significantly speed up queries that filter or sort on that field',
      'To automatically validate the field type',
      'To encrypt the field',
    ],
    correctAnswer: 'To significantly speed up queries that filter or sort on that field',
    explanation: 'Indexes allow MongoDB to avoid scanning every document, dramatically speeding up queries on indexed fields at the cost of additional write overhead.',
    skillNames: ['MongoDB'],
    careerPathTitles: ['Backend Developer (Node.js)'],
    difficultyLevel: 'medium',
  },

  // ---- NEW (Batch 5.3): additional Data Analyst questions ----
  {
    questionText: 'Which SQL JOIN type returns all rows from the left table, and matched rows from the right table (NULL where no match exists)?',
    questionType: 'mcq',
    options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'CROSS JOIN'],
    correctAnswer: 'LEFT JOIN',
    explanation: 'LEFT JOIN returns every row from the left table, with NULLs filled in for columns from the right table when there is no match.',
    skillNames: ['SQL'],
    careerPathTitles: ['Data Analyst'],
    difficultyLevel: 'medium',
  },
  {
    questionText: 'In Python, which built-in data structure is best suited for storing unique, unordered items with fast membership testing?',
    questionType: 'mcq',
    options: ['list', 'tuple', 'set', 'dict'],
    correctAnswer: 'set',
    explanation: 'A set stores unique elements and offers average O(1) membership testing, unlike a list which requires a linear scan.',
    skillNames: ['Python'],
    careerPathTitles: ['Data Analyst'],
    difficultyLevel: 'easy',
  },

  // ---- NEW (Batch 5.3): additional UI/UX Designer questions ----
  {
    questionText: 'What is the primary purpose of a "wireframe" in the design process?',
    questionType: 'mcq',
    options: [
      'To finalize brand colors',
      'To outline a screen\u2019s layout and structure without visual styling',
      'To write production code',
      'To conduct user interviews',
    ],
    correctAnswer: 'To outline a screen\u2019s layout and structure without visual styling',
    explanation: 'Wireframes focus on structure, hierarchy, and layout early in the process, deliberately omitting visual polish so structural decisions can be validated first.',
    skillNames: ['UI/UX Design Fundamentals'],
    careerPathTitles: ['UI/UX Designer'],
    difficultyLevel: 'easy',
  },
];

async function seed() {
  await connectDB();
  logger.info('🌱 Starting seed: Interview Questions...');

  let createdCount = 0;
  let skippedCount = 0;

  for (const q of QUESTIONS) {
    const alreadyExists = await InterviewQuestion.exists({ questionText: q.questionText });
    if (alreadyExists) {
      skippedCount += 1;
      continue;
    }

    const skillDocs = await SkillTaxonomy.find({ skillName: { $in: q.skillNames } });
    const relatedSkillIds = skillDocs.map((s) => s._id);

    const careerPathDocs = await CareerPath.find({ title: { $in: q.careerPathTitles || [] } });
    const relatedCareerPathIds = careerPathDocs.map((cp) => cp._id);

    if (relatedSkillIds.length === 0) {
      logger.warn(`   ⚠️  No matching skills found, skipping question: ${q.questionText.slice(0, 50)}...`);
      skippedCount += 1;
      continue;
    }

    await InterviewQuestion.create({
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      relatedSkillIds,
      relatedCareerPathIds,
      difficultyLevel: q.difficultyLevel,
      isActive: true,
    });

    createdCount += 1;
    logger.info(`   ✅ Created question: ${q.questionText.slice(0, 60)}...`);
  }

  logger.info(`🌱 Seed complete. Created: ${createdCount}, already existed (skipped): ${skippedCount}.`);
  await disconnectDB();
  process.exit(0);
}

seed().catch((error) => {
  logger.error(`Seed failed: ${error.message}`, { stack: error.stack });
  mongoose.disconnect();
  process.exit(1);
});