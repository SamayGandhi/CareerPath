/**
 * htmlFetcher.util.js
 * -----------------------------------------
 * Fetches raw HTML from a user-supplied portfolio URL. This is I/O
 * (external network call) but strictly a DATA-FETCHING layer — no
 * AI/inference involved. Includes basic SSRF-hardening (blocks
 * private/loopback IP-like hostnames) since this endpoint accepts an
 * arbitrary user-supplied URL, which is a classic vector for abuse if
 * unguarded.
 */

const ApiError = require('../../../shared/errors/ApiError');

const FETCH_TIMEOUT_MS = 10000;
const MAX_HTML_SIZE_BYTES = 3 * 1024 * 1024; // 3MB cap — plenty for a portfolio page's HTML

const BLOCKED_HOSTNAME_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^0\.0\.0\.0$/,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^169\.254\./, // link-local, including cloud metadata endpoints
  /^\[?::1\]?$/,
];

function assertUrlIsSafe(urlString) {
  let parsed;
  try {
    parsed = new URL(urlString);
  } catch {
    throw ApiError.badRequest('Please provide a valid URL', 'INVALID_URL');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw ApiError.badRequest('Only http/https URLs are supported', 'INVALID_URL');
  }

  const hostname = parsed.hostname;
  if (BLOCKED_HOSTNAME_PATTERNS.some((pattern) => pattern.test(hostname))) {
    throw ApiError.badRequest('This URL cannot be analyzed', 'INVALID_URL');
  }

  return parsed;
}

/**
 * @param {string} urlString
 * @returns {Promise<string>} raw HTML text
 */
async function fetchHtml(urlString) {
  const parsedUrl = assertUrlIsSafe(urlString);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'career-decision-platform-portfolio-analyzer',
      },
    });

    if (!response.ok) {
      throw ApiError.unprocessable(
        `The provided URL responded with status ${response.status} and could not be analyzed.`,
        'URL_UNREACHABLE'
      );
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      throw ApiError.unprocessable(
        'The provided URL does not appear to serve an HTML page.',
        'URL_UNREACHABLE'
      );
    }

    const html = await response.text();

    if (Buffer.byteLength(html, 'utf8') > MAX_HTML_SIZE_BYTES) {
      return html.slice(0, MAX_HTML_SIZE_BYTES);
    }

    return html;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error.name === 'AbortError') {
      throw ApiError.unprocessable(
        'The provided URL took too long to respond.',
        'URL_UNREACHABLE'
      );
    }
    throw ApiError.unprocessable(
      'Could not reach the provided URL. Please check it is publicly accessible.',
      'URL_UNREACHABLE'
    );
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { fetchHtml, assertUrlIsSafe };