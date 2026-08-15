/**
 * server.js
 * -----------------------------------------
 * Application entry point.
 * UPDATED (Batch 2 — safe auto-initialization): after a successful
 * database connection, calls featureFlagRepository.ensureKnownFlagsExist()
 * so all known feature flags (currently: AI_FEATURE_ENABLED) exist in
 * the database from the very first startup, removing the need for any
 * manual MongoDB document creation. This step is strictly best-effort:
 * any failure here is logged but NEVER prevents the server from
 * starting — feature-flag initialization is a convenience, not a
 * hard dependency, consistent with the platform's "AI is always
 * optional" architecture.
 */

const env = require('./config/env.config');
const logger = require('./config/logger.config');
const { connectDB, disconnectDB } = require('./database/connection');
const app = require('./app');
const featureFlagRepository = require('./modules/admin/featureFlag.repository');

let server;

async function initializeFeatureFlags() {
  try {
    const results = await featureFlagRepository.ensureKnownFlagsExist();
    for (const flag of results) {
      logger.info(`Feature flag ready: ${flag.key} = ${flag.enabled}`);
    }
  } catch (error) {
    // Non-fatal by design — the server must still start even if this
    // convenience step fails (e.g. a transient DB hiccup right after
    // connect). The AI gateway's own getOrCreate() call will retry
    // this lazily on first use regardless.
    logger.warn(`Feature flag initialization skipped due to an error: ${error.message}`);
  }
}

async function startServer() {
  try {
    await connectDB();
    await initializeFeatureFlags();

    server = app.listen(env.PORT, () => {
      logger.info(
        `🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT} | API base: /api/${env.API_VERSION}`
      );
    });
  } catch (error) {
    logger.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

async function gracefulShutdown(signal) {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      await disconnectDB();
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason instanceof Error ? reason.stack : reason}`);
  gracefulShutdown('unhandledRejection');
});

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.stack}`);
  gracefulShutdown('uncaughtException');
});

startServer();