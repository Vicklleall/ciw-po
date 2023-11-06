const config = require('./config');
const globalLogger = require('./src/logger');

// 检查配置
if (!config.maxConnections) {
  globalLogger.warn('config.maxConnections is not specified, using default value 1000');
  config.maxConnections = 1000;
}
if (!config.updateInterval) {
  globalLogger.warn('config.updateInterval is not specified, using default value 2');
  config.updateInterval = 2;
}
if (!config.port) {
  globalLogger.error('config.port is not specified');
}


const express = require('express');
const { createServer } = require(config.https ? 'https' : 'http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(config.https, app);

const socketOptions = {
  path: '/s/',
  serveClient: false
};
const io = new Server(server, socketOptions);

if (config.checkOrigin) {
  // 检查 user-agent 和 origin
  socketOptions.allowRequest = (req, callback) => {
    callback(null, io.engine.clientsCount < config.maxConnections && req.headers['user-agent'].includes('CloudIWanna') && req.headers['origin'] === 'ciw://app');
  };
  app.use('/i', (req, res, next) => {
    if (req.headers['user-agent'].includes('CloudIWanna') && req.headers['origin'] === 'ciw://app') {
      next();
    } else {
      globalLogger.info(`Invalid request: [user-agent] ${req.headers['user-agent']} [origin] ${req.headers['origin']}`);
      res.status(403).end();
    }
  });
} else {
  socketOptions.allowRequest = (req, callback) => {
    callback(null, io.engine.clientsCount < config.maxConnections);
  };
}

// 服务器信息获取路由
require('./src/info')(app, io);
// 联机服务
require('./src/socket')(io);

server.listen(config.port, () => {
  globalLogger.info('Running ciw-po server on port ' + config.port);
});
server.on('error', e => {
  globalLogger.error(e);
});