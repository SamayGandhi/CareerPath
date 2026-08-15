/**
 * sectionDetector.rule.js
 * -----------------------------------------
 * RULE: Deterministic detection of standard portfolio sections (About,
 * Projects, Skills, Contact, Experience) by scanning heading text and
 * nav-link text for known keyword patterns. Also extracts a rough
 * project count and tech-stack mentions. Pure function operating on
 * a parsed cheerio document — no AI involved.
 */

const SECTION_PATTERNS = {
  about: /\babout( me)?\b/i,
  projects: /\b(projects?|portfolio|work)\b/i,
  skills: /\b(skills?|technolog(y|ies)|expertise)\b/i,
  experience: /\b(experience|work history|career)\b/i,
  contact: /\b(contact|get in touch|reach (out|me)|hire me)\b/i,
};

// A broad, explicit list rather than any fuzzy/AI-based tech detection —
// deterministic substring matching against known technology names.
const TECH_STACK_KEYWORDS = [
  'React', 'Vue', 'Angular', 'Next.js', 'Nuxt', 'Svelte',
  'Node.js', 'Express', 'Django', 'Flask', 'Ruby on Rails', 'Spring Boot',
  'JavaScript', 'TypeScript', 'Python', 'Java', 'PHP', 'Go', 'Rust', 'C++', 'C#',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase',
  'AWS', 'Docker', 'Kubernetes', 'GraphQL', 'Tailwind', 'Figma',
];

/**
 * @param {import('cheerio').CheerioAPI} $ - a loaded cheerio document
 * @returns {{
 *   detectedSections: Record<string, boolean>,
 *   projectCount: number,
 *   techStackDetected: string[]
 * }}
 */
function detectSections($) {
  const headingAndNavText = $('h1, h2, h3, h4, nav a, header a, [class*="nav"] a')
    .map((_, el) => $(el).text())
    .get()
    .join(' | ');

  const bodyText = $('body').text();

  const detectedSections = {};
  for (const [sectionName, pattern] of Object.entries(SECTION_PATTERNS)) {
    detectedSections[sectionName] = pattern.test(headingAndNavText) || pattern.test(bodyText);
  }

  // Rough project count heuristic: elements commonly used to wrap
  // individual project cards. Not exact, but explainable and consistent.
  const projectCardSelectors = [
    '[class*="project-card"]',
    '[class*="project-item"]',
    '[class*="portfolio-item"]',
    'article',
  ];
  const projectCount = Math.max(
    ...projectCardSelectors.map((selector) => $(selector).length),
    0
  );

  const techStackDetected = TECH_STACK_KEYWORDS.filter((tech) => {
    const pattern = new RegExp(`\\b${tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return pattern.test(bodyText);
  });

  return { detectedSections, projectCount, techStackDetected };
}

module.exports = { detectSections, SECTION_PATTERNS, TECH_STACK_KEYWORDS };