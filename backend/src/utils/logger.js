const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
  })
);

// Create logger instance based on environment
let logger;

if (process.env.NODE_ENV === 'production') {
  // Production (Vercel): Only console logging
  logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'gemini-api' },
    transports: [
      new winston.transports.Console({
        format: consoleFormat
      })
    ]
  });
} else {
  // Development: File + console logging
  logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'gemini-api' },
    transports: [
      new winston.transports.File({ 
        filename: path.join(process.cwd(), 'logs', 'error.log'), 
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5
      }),
      new winston.transports.File({ 
        filename: path.join(process.cwd(), 'logs', 'combined.log'),
        maxsize: 5242880, // 5MB
        maxFiles: 5
      }),
      new winston.transports.Console({
        format: consoleFormat
      })
    ]
  });
}

module.exports = logger;
