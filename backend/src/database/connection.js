/**
 * connection.js
 * -----------------------------------------
 * MongoDB connection handler via Mongoose. Includes retry-with-backoff
 * logic on initial connection failure (common in containerized/orchestrated
 * environments where the DB may not be ready the instant the app starts),
 * and listens for runtime connection events for observability.
 */

const mongoose = require('mongoose');
const env = require('../config/env.config');
const logger = require('../config/logger.config');
const mongooseOptions = require('../config/db.config');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

async function connectDB(retryCount = 0) {
  try {
    await mongoose.connect(env.MONGO_URI, mongooseOptions);
    logger.info(`✅ MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (error) {
    logger.error(`❌ MongoDB connection failed: ${error.message}`);

    if (retryCount < MAX_RETRIES) {
      const nextAttempt = retryCount + 1;
      logger.warn(
        `Retrying MongoDB connection (${nextAttempt}/${MAX_RETRIES}) in ${RETRY_DELAY_MS / 1000}s...`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return connectDB(nextAttempt);
    }

    logger.error('❌ Exhausted MongoDB connection retries. Exiting process.');
    process.exit(1);
  }
}

mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️  MongoDB disconnected.');
});

mongoose.connection.on('reconnected', () => {
  logger.info('✅ MongoDB reconnected.');
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err.message}`);
});

async function disconnectDB() {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed.');
}

module.exports = { connectDB, disconnectDB };