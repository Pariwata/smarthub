/**
 * Logging Utility
 * Centralized logging with different levels and formatting
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');
const { config } = require('../config');

// Ensure logs directory exists
const logsDir = path.join(config.app.dataDir, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `[${timestamp}] ${level}: ${message} ${metaStr}`;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: config.app.logLevel,
  transports: [
    // Console transport
    new winston.transports.Console({
      format: consoleFormat
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logsDir, 'app.log'),
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // File transport for errors only
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

// Add email-specific logging methods
logger.emailFetch = (message, meta = {}) => {
  logger.info(`[EMAIL-FETCH] ${message}`, meta);
};

logger.emailCategorize = (message, meta = {}) => {
  logger.info(`[CATEGORIZE] ${message}`, meta);
};

logger.emailAnalyze = (message, meta = {}) => {
  logger.info(`[ANALYZE] ${message}`, meta);
};

logger.emailManage = (message, meta = {}) => {
  logger.info(`[MANAGE] ${message}`, meta);
};

module.exports = logger;
