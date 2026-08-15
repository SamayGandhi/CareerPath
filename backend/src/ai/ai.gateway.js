/**
 * ai.gateway.js
 * -----------------------------------------
 * THE SINGLE, SANCTIONED ENTRY POINT for every AI enhancement in this
 * application. No controller, service, or route outside src/ai/ should
 * ever import providers/httpProvider.js or know the Python service's
 * URL/protocol — everything goes through the methods exported here.
 *
 * Resilience contract enforced at this layer, unconditionally:
 * 1. Checks the LIVE feature flag (MongoDB-backed, Phase 18) before
 *    attempting anything — if AI is administratively disabled, this
 *    returns instantly with zero network calls.
 * 2. Circuit breaker: after N consecutive failures, stops attempting
 *    calls for a cooldown window, to avoid every request in a busy
 *    period each individually waiting out a timeout against a known-
 *    down service.
 * 3. Every public method returns a plain, predictable
 *    { attempted, success, data?, reason? } object. NEVER throws.
 *    Callers (existing rule-based services) never need a try/catch
 *    around these calls — the contract is exception-free by design.
 * 4. Logs failures for observability but never lets a logging failure
 *    itself become a new failure mode.
 */

const logger = require('../config/logger.config');
const aiConfig = require('./ai.config');
const httpProvider = require('./providers/httpProvider');
const featureFlagRepository = require('../modules/admin/featureFlag.repository');
const {
  skillGapExplanationPayloadSchema,
  recommendationExplanationPayloadSchema,
  resumeSuggestionsPayloadSchema,
  githubSummaryPayloadSchema,
  portfolioFeedbackPayloadSchema,
} = require('./ai.validation');

const AI_FEATURE_FLAG_KEY = 'AI_FEATURE_ENABLED';

// ---- Circuit breaker state (in-process, per Node instance) ----
let consecutiveFailures = 0;
let circuitOpenUntil = null;

function isCircuitOpen() {
  if (!circuitOpenUntil) return false;
  if (Date.now() >= circuitOpenUntil) {
    // Cooldown elapsed — half-open: allow the next call through to
    // test recovery, resetting the failure counter optimistically.
    circuitOpenUntil = null;
    consecutiveFailures = 0;
    return false;
  }
  return true;
}

function recordFailure() {
  consecutiveFailures += 1;
  if (consecutiveFailures >= aiConfig.CIRCUIT_BREAKER_THRESHOLD) {
    circuitOpenUntil = Date.now() + aiConfig.CIRCUIT_BREAKER_COOLDOWN_MS;
    logger.warn(
      `AI Gateway: circuit breaker OPEN after ${consecutiveFailures} consecutive failures. ` +
        `Cooling down for ${aiConfig.CIRCUIT_BREAKER_COOLDOWN_MS}ms.`
    );
  }
}

function recordSuccess() {
  consecutiveFailures = 0;
  circuitOpenUntil = null;
}

/**
 * Checks whether AI enhancement should even be attempted right now:
 * statically configured (has an internal key set) AND the live
 * database feature flag says enabled AND the circuit breaker isn't
 * open. Any single "no" short-circuits to an instant, network-free
 * "not attempted" result.
 */
async function shouldAttempt() {
  if (!aiConfig.isStaticallyConfigured) {
    return { allowed: false, reason: 'not_configured' };
  }

  if (isCircuitOpen()) {
    return { allowed: false, reason: 'circuit_open' };
  }

  try {
    const flag = await featureFlagRepository.getOrCreate(AI_FEATURE_FLAG_KEY);
    if (!flag.enabled) {
      return { allowed: false, reason: 'feature_disabled' };
    }
  } catch (error) {
    // If we can't even read the flag (DB hiccup), fail safe: don't
    // attempt AI. The rule-based result is always the priority.
    logger.warn(`AI Gateway: could not read feature flag, skipping AI call: ${error.message}`);
    return { allowed: false, reason: 'flag_check_failed' };
  }

  return { allowed: true };
}

/**
 * Generic call executor shared by every public method below: gates on
 * shouldAttempt(), validates the payload, calls the HTTP provider,
 * updates circuit breaker state, and normalizes the return shape.
 */
async function executeCall(path, payloadSchema, rawPayload) {
  const gate = await shouldAttempt();
  if (!gate.allowed) {
    return { attempted: false, success: false, reason: gate.reason };
  }

  const parsed = payloadSchema.safeParse(rawPayload);
  if (!parsed.success) {
    // A malformed payload from OUR side is a programming error, not an
    // AI-service failure — log it distinctly and never send it out.
    logger.error(`AI Gateway: invalid outgoing payload for ${path}: ${parsed.error.message}`);
    return { attempted: false, success: false, reason: 'invalid_payload' };
  }

  const result = await httpProvider.postJson(path, parsed.data);

  if (!result.ok) {
    recordFailure();
    return { attempted: true, success: false, reason: result.reason };
  }

  if (!result.data.success) {
    // Service reached, but it honestly reported it couldn't produce a
    // result (e.g. its own LLM key missing, rate limited). This is
    // NOT a transport failure, so it does not trip the circuit breaker
    // — the service is healthy, just currently unable to help.
    return { attempted: true, success: false, reason: result.data.reason || 'ai_unable' };
  }

  recordSuccess();
  return { attempted: true, success: true, data: result.data };
}

// ---------------------------------------------------------------
// Public API — one method per AI-enhanced feature in the platform
// ---------------------------------------------------------------

/**
 * @param {{ careerPathTitle: string, readinessScore: number, gaps: Array }} payload
 * @returns {Promise<{ attempted: boolean, success: boolean, explanation?: string, reason?: string }>}
 */
async function explainSkillGap(payload) {
  const result = await executeCall('/explain/skill-gap', skillGapExplanationPayloadSchema, payload);
  if (!result.success) return result;
  return { attempted: true, success: true, explanation: result.data.explanation };
}

/**
 * @param {{ strategyLabel: string, courses: Array }} payload
 */
async function explainRecommendation(payload) {
  const result = await executeCall(
    '/explain/recommendation',
    recommendationExplanationPayloadSchema,
    payload
  );
  if (!result.success) return result;
  return { attempted: true, success: true, explanation: result.data.explanation };
}

/**
 * @param {{ extractedSkills: string[], atsBreakdown: Array, missingSkills: string[] }} payload
 */
async function generateResumeSuggestions(payload) {
  const result = await executeCall(
    '/analyze/resume-suggestions',
    resumeSuggestionsPayloadSchema,
    payload
  );
  if (!result.success) return result;
  return { attempted: true, success: true, suggestions: result.data.suggestions };
}

/**
 * @param {{ languages: Array, originalRepoCount: number, totalStars: number, qualitySignals: Array }} payload
 */
async function generateGithubSummary(payload) {
  const result = await executeCall('/analyze/github-summary', githubSummaryPayloadSchema, payload);
  if (!result.success) return result;
  return { attempted: true, success: true, summary: result.data.summary };
}

/**
 * @param {{ detectedSections: object, projectCount: number, techStackDetected: string[] }} payload
 */
async function generatePortfolioFeedback(payload) {
  const result = await executeCall(
    '/analyze/portfolio-feedback',
    portfolioFeedbackPayloadSchema,
    payload
  );
  if (!result.success) return result;
  return { attempted: true, success: true, feedback: result.data.feedback };
}

/**
 * Exposed for the Admin Panel's AI Reliability tab (Phase 18) to
 * report real, live status instead of the "not yet implemented"
 * placeholder — used by admin.service.js in this same step's next
 * part.
 */
async function getServiceStatus() {
  const gate = await shouldAttempt();
  const health = aiConfig.isStaticallyConfigured ? await httpProvider.checkHealth() : { ok: false };

  return {
    staticallyConfigured: aiConfig.isStaticallyConfigured,
    featureFlagAllowed: gate.allowed || gate.reason !== 'feature_disabled',
    circuitOpen: isCircuitOpen(),
    serviceReachable: health.ok,
    llmConfiguredOnService: health.data?.llmConfigured ?? null,
  };
}

module.exports = {
  explainSkillGap,
  explainRecommendation,
  generateResumeSuggestions,
  generateGithubSummary,
  generatePortfolioFeedback,
  getServiceStatus,
};