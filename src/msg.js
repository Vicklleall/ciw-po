module.exports = (mode, socket) => {
  // 聊天消息
  socket.on('msg', data => {
    if (!socket.$room || !socket.$user) return;
    socket.to(socket.$room.id).emit('msg', socket.$user.uid + data);
    socket.$room.logger?.verbose(`${socket.$user.name}(${socket.$user.uid}): ${data}`);
  });
};