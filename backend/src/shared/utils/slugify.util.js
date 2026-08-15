/**
 * slugify.util.js
 * -----------------------------------------
 * Converts a display string into a URL-safe, kebab-case slug.
 * Used by SkillTaxonomy and CareerPath modules to auto-generate
 * unique, human-readable identifiers for public URLs and API lookups.
 */

function slugify(text) {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // strip non-word chars
    .replace(/[\s_]+/g, '-') // collapse whitespace/underscores to a single hyphen
    .replace(/-+/g, '-') // collapse multiple hyphens
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
}

module.exports = slugify;