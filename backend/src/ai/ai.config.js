/**
 * ai.config.js
 * -----------------------------------------
 * Configuration for the AI Enhancement Layer, isolated from the main
 * env.config.js so it's obvious at a glance which settings are
 * AI-specific and entirely optional. Nothing outside src/ai/ should
 * import this file directly — go through ai.gateway.js instead.
 */

const aiConfig = {
  SERVICE_BASE_URL: process.env.AI_SERVICE_BASE_URL || 'http://localhost:8000',
  INTERNAL_KEY: process.env.AI_SERVICE_INTERNAL_KEY || '',
  TIMEOUT_MS: parseInt(process.env.AI_TIMEOUT_MS, 10) || 8000,
  CIRCUIT_BREAKER_THRESHOLD: parseInt(process.env.AI_CIRCUIT_BREAKER_THRESHOLD, 10) || 3,
  CIRCUIT_BREAKER_COOLDOWN_MS: parseInt(process.env.AI_CIRCUIT_BREAKER_COOLDOWN_MS, 10) || 60000,
  STARTUP_DEFAULT_ENABLED: process.env.AI_FEATURE_ENABLED === 'true',

  /**
   * A statically-configured service is a prerequisite for even
   * attempting a call — separate from whether the feature flag (live,
   * DB-backed) says it should be used right now.
   */
  get isStaticallyConfigured() {
    return Boolean(this.INTERNAL_KEY);
  },
};

module.exports = aiConfig;