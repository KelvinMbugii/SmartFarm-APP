module.exports = (socket, io) => {
    //Join user to their personal room

    socket.on('join-user', (userId) => {
        socket.join(userId);
        socket.userId = userId;
    });

    // Join chat room
    socket.on('join-chat', (chatId) => {
        socket.join(chatId);
    });

    // Leave chat room
    socket.on('leave-chat', (chatId) => {
        socket.join(chatId);
    });

    // Send message
    socket.on('send-message', (data) => {
        const { chatId, message, recipientId } = data;

        // Emit to chat room
        io.to(chatId).emit('new-message', {
            chatId,
            message,
            sender: socket.userId
        });

        if (recipientId){
            io.to(recipientId).emit('message-notification',
                {
                    chatId,
                    message,
                    sender: socket.userId
                }
            );
        }
    });

    // Typing Indicators
    socket.on('typing-stop', (data) => {
        socket.to(data.chatId).emit('user-stopped-typing', {
            userId: socket.userId,
            chatId: data.chatId
        });
    });

    // Message read recepts
    socket.on('message-read', (data) => {
        socket.to(data.chatId).emit('message-read', {
            messageId: data.messageId,
            userId: socket.userId
        });
    });
};