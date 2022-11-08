const path = require('path');

const { createLogger, format, transports } = require('winston');
const { logLevel } = require('../config');

const errorTransports = new transports.File({
  filename: path.join('logs', 'err.log'),
  level: 'error'
});

module.exports = createLogger({
  level: logLevel,
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD hh:mm:ss' }),
    format.printf(info => `[${info.level}] ${info.timestamp} > ${info.message}`)
  ),
  transports: [
    new transports.File({
      filename: path.join('logs', 'out.log'),
      level: 'verbose'
    }),
    errorTransports
  ],
  exceptionHandlers: [
    errorTransports
  ]
});