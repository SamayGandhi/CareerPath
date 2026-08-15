/**
 * recentCareerPaths.js
 * -----------------------------------------
 * Purely client-side "recently viewed career paths" tracking, stored
 * in localStorage — the same safe, zero-backend-risk pattern already
 * used for GitHub username suggestions. No API, no database, no new
 * backend collection. Consumed by CareerPathDetailPage.jsx (writer)
 * and DashboardHome.jsx (reader).
 */

const RECENT_CAREER_PATHS_KEY = 'recentCareerPaths';
const MAX_RECENT = 5;

export function getRecentCareerPaths() {
  try {
    const raw = localStorage.getItem(RECENT_CAREER_PATHS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentCareerPath({ _id, title, slug }) {
  if (!_id || !title || !slug) return;

  try {
    const existing = getRecentCareerPaths().filter((cp) => cp._id !== _id);
    const updated = [{ _id, title, slug }, ...existing].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_CAREER_PATHS_KEY, JSON.stringify(updated));
  } catch {
    // localStorage unavailable — non-fatal, this widget simply stays empty.
  }
}