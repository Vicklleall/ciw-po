module.exports = socket => {
  // 聊天消息
  socket.on('msg', data => {
    if (!socket.$room || !socket.$user) return;
    socket.to(socket.$room.id).emit('msg', {u: socket.$user.data.i, d: data});
    console.log(`Room ${socket.$room.id} player ${socket.$user.data.i.slice(0, 10)} ${socket.$user.data.i.slice(10)}: ${data}`);
  });
};