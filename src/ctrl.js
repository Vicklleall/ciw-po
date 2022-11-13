const RoomManager = require('./room');

module.exports = (mode, socket) => {
  // ping延迟
  socket.on('ping', callback => {
    callback();
  });

  // 创建新房间
  socket.on('ctrl:room', ({g: GID, n: roomName}, callback) => {
    const newRoom = RoomManager.newPublicRoom(mode, GID, roomName);
    callback(newRoom.id);
  });

  // 加入房间
  socket.on('ctrl:join', ({r: roomId, rn: roomName, u: user}, callback) => {
    let room;
    if (roomId.length === 10 || roomId[10] === '-') { // 公开房间
      const GID = roomId.slice(0, 10);
      room = RoomManager.getPublicRoom(mode, GID, roomId);
      if (!room) room = RoomManager.newPublicRoom(mode, GID, roomName, roomId);
      socket.$user = room.joinPlayer(user);
    } else { // 私有房间
      room = RoomManager.getPrivateRoom(mode, roomId);
      socket.$user = room.joinPlayer(user);
    }
    socket.$room = room;
    socket.$user.socket = socket;

    socket.join(roomId);
    socket.to(roomId).emit('msg:join', user);

    const roomData = {p: room.players.map(p => p.getFullData())};
    if (room.data) roomData.d = room.data;
    callback(roomData);
  });

  // 断开连接
  socket.on('disconnect', () => {
    if (!socket.$room || !socket.$user) return;
    socket.$room.removePlayer(socket.$user);
    socket.to(socket.$room.id).emit('msg:leave', socket.$user.uid);
  });
};