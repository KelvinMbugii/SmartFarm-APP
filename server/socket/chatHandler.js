module.exports = (socket, io) => {
  socket.on('join-user', (userId) => {
    socket.join(userId);
    socket.userId = userId;
  });

  socket.on('join-chat', (chatId) => {
    socket.join(chatId);
  });

  socket.on('leave-chat', (chatId) => {
    socket.leave(chatId);
  });

  socket.on('send-message', (data) => {
    const { chatId, message, recipientId } = data;

    io.to(chatId).emit('new-message', {
      chatId,
      message,
      sender: socket.userId,
    });

    if (recipientId) {
      io.to(recipientId).emit('message-notification', {
        chatId,
        message,
        sender: socket.userId,
      });
    }
  });

  socket.on('typing-start', (data) => {
    socket.to(data.chatId).emit('user-typing', {
      userId: socket.userId,
      chatId: data.chatId,
    });
  });

  socket.on('typing-stop', (data) => {
    socket.to(data.chatId).emit('user-stopped-typing', {
      userId: socket.userId,
      chatId: data.chatId,
    });
  });

  socket.on('message-read', (data) => {
    socket.to(data.chatId).emit('message-read', {
      messageId: data.messageId,
      userId: socket.userId,
      chatId: data.chatId,
    });
  });
};