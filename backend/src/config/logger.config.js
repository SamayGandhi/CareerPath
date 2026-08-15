/**
 * logger.config.js
 * -----------------------------------------
 * Winston-based structured logger with daily file rotation.
 * Used throughout the app instead of console.log for production-grade,
 * queryable, leveled logging.
 */

const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');
const env = require('./env.config');

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const consoleFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) => {
    return `${ts} [${level}]: ${stack || message}`;
  })
);

const fileFormat = combine(timestamp(), errors({ stack: true }), json());

const dailyRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(process.cwd(), 'logs', 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: fileFormat,
});

const errorRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(process.cwd(), 'logs', 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error',
  format: fileFormat,
});

const transports = [dailyRotateTransport, errorRotateTransport];

// Console logging only in non-production environments to keep prod logs clean/structured
if (!env.IS_PRODUCTION) {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
} else {
  // In production, still emit console logs (captured by container orchestrators)
  // but in JSON format for log aggregation tools.
  transports.push(
    new winston.transports.Console({
      format: fileFormat,
    })
  );
}

const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  transports,
  exitOnError: false,
});

module.exports = logger;