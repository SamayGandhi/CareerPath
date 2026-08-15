/**
 * httpProvider.js
 * -----------------------------------------
 * Thin, isolated HTTP transport used ONLY by ai.gateway.js. Uses
 * native fetch (Node 18+, already a hard requirement elsewhere in
 * this codebase — GitHub Analyzer, Portfolio Analyzer). Enforces the
 * configured timeout via AbortController and NEVER throws an
 * exception the caller has to catch defensively — every failure mode
 * (network error, timeout, non-2xx, invalid JSON) resolves to a
 * consistent { ok: false, reason } shape.
 */

const aiConfig = require('../ai.config');

/**
 * @param {string} path - e.g. '/explain/skill-gap'
 * @param {object} body
 * @returns {Promise<{ ok: boolean, data?: object, reason?: string }>}
 */
async function postJson(path, body) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), aiConfig.TIMEOUT_MS);

  try {
    const response = await fetch(`${aiConfig.SERVICE_BASE_URL}${path}`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Api-Key': aiConfig.INTERNAL_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return { ok: false, reason: `http_${response.status}` };
    }

    const data = await response.json();
    return { ok: true, data };
  } catch (error) {
    if (error.name === 'AbortError') {
      return { ok: false, reason: 'timeout' };
    }
    return { ok: false, reason: 'network_error' };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Lightweight liveness check against the AI service's /health endpoint
 * — no internal-key header needed (health is intentionally public),
 * short timeout since this should never meaningfully block anything.
 */
async function checkHealth() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(`${aiConfig.SERVICE_BASE_URL}/health`, {
      signal: controller.signal,
    });
    if (!response.ok) return { ok: false };
    const data = await response.json();
    return { ok: true, data };
  } catch {
    return { ok: false };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { postJson, checkHealth };