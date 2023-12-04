const { version } = require('../package.json');
const config = require('../config');
const RoomManager = require('./room');

let headerHandler;
if (config.checkOrigin) {
  // 检查 origin 和 user-agent
  headerHandler = (res, req) => {
    const origin = req.getHeader('origin');
    const userAgent = req.getHeader('user-agent');
    if (origin !== 'ciw://app' || !userAgent?.includes('CloudIWanna')) {
      globalLogger.info(`Invalid request: [origin] ${origin} [user-agent] ${userAgent}`);
      res.close();
      return false;
    }
    return true;
  };
} else {
  // 跨域访问
  headerHandler = res => {
    res.writeHeader('Access-Control-Allow-Origin', '*');
    return true;
  };
}

module.exports = (app, io) => {
  // 获取服务器信息
  app.get('/i/', (res, req) => {
    if (headerHandler(res, req)) {
      res.end(JSON.stringify({
        v: version,               // 版本
        i: config.updateInterval, // 数据更新帧间隔
        a: io.engine.clientsCount < config.maxConnections // 是否可用
      }));
    }
  });

  for (const mode of ['plain', 'race', 'coop']) {
    // 获取联机房间数据
    app.get('/i/' + mode + '/*', (res, req) => {
      if (headerHandler(res, req)) {
        const url = req.getUrl();
        const GID = url.slice(url.lastIndexOf('/') + 1);
        const rooms = RoomManager.getPublicRoomList(mode, GID);
        res.end(JSON.stringify(
          rooms.map(r => ({
            i: r.id, n: r.name, p: r.players.length
          }))
        ));
      }
    });
  }
};