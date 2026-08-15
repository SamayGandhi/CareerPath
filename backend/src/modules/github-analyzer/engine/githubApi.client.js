/**
 * githubApi.client.js
 * -----------------------------------------
 * Thin client for GitHub's public REST API. This is I/O (external
 * network call) but strictly a DATA-FETCHING layer — no AI/inference
 * involved. All actual analysis (language stats, quality heuristics)
 * happens in the pure rule files that consume this client's output.
 *
 * Uses global fetch (available natively in Node.js 18+, matching our
 * documented engine requirement), so no extra HTTP client dependency
 * is needed.
 */

const ApiError = require('../../../shared/errors/ApiError');

const GITHUB_API_BASE_URL = process.env.GITHUB_API_BASE_URL || 'https://api.github.com';
const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN || '';

function buildHeaders() {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'career-decision-platform',
  };
  if (GITHUB_API_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_API_TOKEN}`;
  }
  return headers;
}

async function handleResponse(response, notFoundMessage) {
  if (response.status === 404) {
    throw ApiError.notFound(notFoundMessage, 'GITHUB_USER_NOT_FOUND');
  }

  if (response.status === 403) {
    const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
    if (rateLimitRemaining === '0') {
      throw ApiError.tooManyRequests(
        'GitHub API rate limit reached. Please try again later.',
        'GITHUB_API_RATE_LIMITED'
      );
    }
    throw ApiError.forbidden('GitHub API access forbidden', 'GITHUB_API_FORBIDDEN');
  }

  if (!response.ok) {
    throw ApiError.internal(`GitHub API request failed with status ${response.status}`);
  }

  return response.json();
}

async function getUserProfile(username) {
  const response = await fetch(`${GITHUB_API_BASE_URL}/users/${encodeURIComponent(username)}`, {
    headers: buildHeaders(),
  });
  return handleResponse(response, `GitHub user "${username}" not found`);
}

async function getUserRepos(username, { perPage = 100 } = {}) {
  const response = await fetch(
    `${GITHUB_API_BASE_URL}/users/${encodeURIComponent(username)}/repos?per_page=${perPage}&sort=updated`,
    { headers: buildHeaders() }
  );
  return handleResponse(response, `GitHub user "${username}" not found`);
}

async function getRepoLanguages(username, repoName) {
  const response = await fetch(
    `${GITHUB_API_BASE_URL}/repos/${encodeURIComponent(username)}/${encodeURIComponent(repoName)}/languages`,
    { headers: buildHeaders() }
  );
  // Non-fatal — a single repo's language fetch failing shouldn't abort
  // the whole analysis; return empty object and let the caller continue.
  if (!response.ok) return {};
  return response.json();
}

module.exports = { getUserProfile, getUserRepos, getRepoLanguages };