const { version } = require('../package.json');
const config = require('../config');
const RoomManager = require('./room');

module.exports = (app, io) => {
  // 获取服务器信息
  app.get('/i/', (req, res) => {
    res.json({
      v: version,               // 版本
      i: config.updateInterval, // 数据更新帧间隔
      a: io.engine.clientsCount < config.maxConnections // 是否可用
    });
  });

  for (const mode of ['plain', 'race', 'coop']) {
    // 获取联机房间数据
    app.get('/i/' + mode + '/*', (req, res) => {
      const GID = req.url.slice(req.url.lastIndexOf('/') + 1);
      const rooms = RoomManager.getPublicRoomList(mode, GID);
      res.json(rooms.map(r => ({
        i: r.id, n: r.name, p: r.players.length
      })));
    });
  }
};