const { version } = require('../package.json');
const RoomManager = require('./room');

module.exports = (app, io) => {
  // 获取版本信息
  app.get('/i/version', (req, res) => {
    res.send(version);
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