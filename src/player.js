const Player = class {
  constructor(user) {
    this.uid = user.slice(0, 10);
    this.name = user.slice(10);
    this.data = {i: this.uid};
  }

  getFullData() {
    return {...this.data, i: this.uid + this.name};
  }

  updatePosition(data) {
    this.data.x = data.x;
    this.data.y = data.y;
    this.data.s = data.s; // ang|ang|h|spr|spr|spr
    this.data.r = data.r; // Room
  }
};

const registerPlayerEvents = socket => {
  // 更新玩家位置
  socket.on('data:pos', data => {
    if (!socket.$room || !socket.$user) return;
    const roomChange = data.r !== socket.$user.data.r;
    socket.$user.updatePosition(data);
    if (roomChange) {
      socket.to(socket.$room.id).emit('data:pos', socket.$user.data);
    } else {
      for (const player of socket.$room.players) {
        if (player !== socket.$user && player.data.r === data.r && data.r >= 0) {
          player.socket.volatile.emit('data:pos', socket.$user.data);
        }
      }
    }
  });
};

module.exports = {
  Player,
  registerPlayerEvents
};