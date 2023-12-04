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
  process.exit(1);
}

const uWebSockets = require("uWebSockets.js");
const { Server } = require("socket.io");

const app = config.https ? uWebSockets.SSLApp(config.https) : uWebSockets.App();

const socketOptions = {
  path: '/s/',
  serveClient: false
};
const io = new Server(socketOptions);

io.attachApp(app);

if (config.checkOrigin) {
  // 检查 origin 和 user-agent
  socketOptions.allowRequest = (req, callback) => {
    callback(null, io.engine.clientsCount < config.maxConnections && req.headers['user-agent'].includes('CloudIWanna') && req.headers['origin'] === 'ciw://app');
  };
} else {
  socketOptions.allowRequest = (req, callback) => {
    callback(null, io.engine.clientsCount < config.maxConnections);
  };
  // 跨域访问
  io.engine.on('headers', headers => {
    headers['Access-Control-Allow-Origin'] = '*';
  });
}

// 服务器信息获取路由
require('./src/info')(app, io);
// 联机服务
require('./src/socket')(io);

app.listen(config.port, listenSocket => {
  if (listenSocket) {
    globalLogger.info('Running ciw-po server on port ' + config.port);
  } else {
    globalLogger.error('Failed to launch ciw-po server on port ' + config.port);
  }
});