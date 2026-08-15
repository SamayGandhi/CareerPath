/**
 * env.config.js
 * -----------------------------------------
 * Centralized environment variable loader and validator.
 * Fails fast on application startup if required variables are missing,
 * rather than allowing the app to boot into an invalid state.
 */

const dotenv = require('dotenv');
const path = require('path');

// Load .env file from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * List of environment variables that MUST be present for the
 * application to start safely. AI-related variables are intentionally
 * excluded from this required list — the platform must boot and run
 * perfectly even if AI configuration is absent or disabled.
 */
const REQUIRED_ENV_VARS = [
  'NODE_ENV',
  'PORT',
  'MONGO_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
];

function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    // eslint-disable-next-line no-console
    console.error(
      `❌ Missing required environment variables: ${missing.join(', ')}\n` +
        `   Please check your .env file against .env.example`
    );
    process.exit(1);
  }
}

validateEnv();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  API_VERSION: process.env.API_VERSION || 'v1',

  MONGO_URI: process.env.MONGO_URI,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',

  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',

  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX, 10) || 300,

  // Reserved for future AI module — NOT consumed anywhere in the core app yet.
  AI_FEATURE_ENABLED: process.env.AI_FEATURE_ENABLED === 'true',
  AI_PROVIDER: process.env.AI_PROVIDER || 'none',
  AI_PROVIDER_API_KEY: process.env.AI_PROVIDER_API_KEY || '',
  AI_TIMEOUT_MS: parseInt(process.env.AI_TIMEOUT_MS, 10) || 8000,

  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_TEST: process.env.NODE_ENV === 'test',
};

module.exports = env;