export const registerChatHandlers = (io, socket) => {
  socket.on('chat:join', (roomId) => {
    if (roomId) {
      socket.join(roomId);
    }
  });

  socket.on('chat:leave', (roomId) => {
    if (roomId) {
      socket.leave(roomId);
    }
  });

  socket.on('chat:message', (payload) => {
    const { roomId, message } = payload ?? {};

    if (!roomId || !message) {
      return;
    }

    io.to(roomId).emit('chat:message', {
      roomId,
      message,
      socketId: socket.id,
      createdAt: new Date().toISOString(),
    });
  });
};
