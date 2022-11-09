const { createLogger, format, transports } = require('winston');
const { logLevel } = require('../config');

const consoleTransports = new transports.Console();

module.exports = createLogger({
  level: logLevel ?? 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD hh:mm:ss' }),
    format.printf(info => `[${info.level}] ${info.timestamp} > ${info.message}`)
  ),
  transports: [consoleTransports],
  exceptionHandlers: [consoleTransports]
});