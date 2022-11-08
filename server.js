const config = require('./config');

const express = require('express');
const { createServer } = require(config.https ? 'https' : 'http');
const { Server } = require("socket.io");

const globalLogger = require('./src/logger');

const app = express();
const server = createServer(config.https, app);

const socketOptions = {
  path: '/s/',
  serveClient: false
};
if (config.checkOrigin) {
  // 检查 user-agent 和 origin
  socketOptions.allowRequest = (req, callback) => {
    callback(null, req.headers['user-agent'].includes('CloudIWanna') && req.headers['origin'] === 'ciw://app');
  };
  app.use('/i', (req, res, next) => {
    if (req.headers['user-agent'].includes('CloudIWanna') && req.headers['origin'] === 'ciw://app') {
      res.setHeader('CIW_PO', '*');
      next();
    } else {
      res.status(403).end();
    }
  });
}

const io = new Server(server, socketOptions);

io.engine.on('headers', headers => {
  headers['CIW_PO'] = '*';
});

// 服务器信息获取路由
require('./src/info')(app, io);
// 联机服务
require('./src/socket')(io);

server.listen(config.port, () => {
  globalLogger.info('Running ciw-po server on port ' + config.port);
});