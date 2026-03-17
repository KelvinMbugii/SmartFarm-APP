// const Notification = require("../models/notification");

// module.exports = (socket, io) => {
//   socket.on("join-user", (userId) => {
//     socket.join(userId);
//     socket.userId = userId;
//   });

//   socket.on("join-chat", (chatId) => {
//     socket.join(chatId);
//   });

//   socket.on("leave-chat", (chatId) => {
//     socket.leave(chatId);
//   });

//   socket.on("send-message", async (data) => {
//     const { chatId, message, recipientId } = data;

//     io.to(chatId).emit("new-message", {
//       chatId,
//       message,
//       sender: socket.userId,
//     });

//     if (recipientId) {
//       io.to(recipientId).emit("message-notification", {
//         chatId,
//         message,
//         sender: socket.userId,
//       });

//       if (String(recipientId) !== String(socket.userId)) {
//         try {
//           const messagePreview =
//             typeof message === "string"
//               ? message
//               : message?.content || message?.text || "You have a new message";

//           const notification = await Notification.create({
//             user: recipientId,
//             type: "message",
//             title: "New message",
//             body: String(messagePreview).slice(0, 200),
//             meta: {
//               chatId,
//               senderId: socket.userId,
//               route: `/chat?chatId=${chatId}`,
//             },
//           });

//           io.to(recipientId).emit("notification:new", notification);
//         } catch (error) {
//           // Best effort only; message delivery should not fail because of notifications.
//         }
//       }
//     }
//   });

//   socket.on("typing-start", (data) => {
//     socket.to(data.chatId).emit("user-typing", {
//       userId: socket.userId,
//       chatId: data.chatId,
//     });
//   });

//   socket.on("typing-stop", (data) => {
//     socket.to(data.chatId).emit("user-stopped-typing", {
//       userId: socket.userId,
//       chatId: data.chatId,
//     });
//   });

//   socket.on("message-read", (data) => {
//     socket.to(data.chatId).emit("message-read", {
//       messageId: data.messageId,
//       userId: socket.userId,
//       chatId: data.chatId,
//     });
//   });
// };





const Notification = require("../models/notification");

/* ================= GLOBAL PRESENCE ================= */
const onlineUsers = new Map();
// userId -> socketId

module.exports = (socket, io) => {
  /* ================= USER JOIN ================= */
  socket.on("join-user", (userId) => {
    socket.userId = userId;

    // Track user
    onlineUsers.set(String(userId), socket.id);

    // Join personal room
    socket.join(String(userId));

    // Broadcast updated online users
    io.emit("online-users", Array.from(onlineUsers.keys()));
  });

  /* ================= CHAT ROOMS ================= */
  socket.on("join-chat", (chatId) => {
    socket.join(String(chatId));
  });

  socket.on("leave-chat", (chatId) => {
    socket.leave(String(chatId));
  });

  /* ================= SEND MESSAGE ================= */
  socket.on("send-message", async (data) => {
    try {
      const { chatId, message, recipientId } = data;

      if (!chatId || !message) return;

      /* ---- Emit to chat room ---- */
      io.to(String(chatId)).emit("new-message", {
        chatId,
        message,
      });

      /* ---- Direct notification ---- */
      if (recipientId) {
        io.to(String(recipientId)).emit("message-notification", {
          chatId,
          message,
        });

        /* ---- Persist notification ---- */
        if (String(recipientId) !== String(socket.userId)) {
          try {
            const preview =
              message?.text ||
              message?.content ||
              message?.fileName ||
              "New message";

            const notification = await Notification.create({
              user: recipientId,
              type: "message",
              title: "New message",
              body: String(preview).slice(0, 200),
              meta: {
                chatId,
                senderId: socket.userId,
                route: `/chat/${chatId}`, // ✅ FIXED ROUTE
              },
            });

            io.to(String(recipientId)).emit("notification:new", notification);
          } catch (err) {
            console.error("Notification error:", err.message);
          }
        }
      }
    } catch (err) {
      console.error("send-message error:", err.message);
    }
  });

  /* ================= TYPING ================= */
  socket.on("typing-start", ({ chatId }) => {
    socket.to(String(chatId)).emit("user-typing", {
      userId: socket.userId,
      chatId,
    });
  });

  socket.on("typing-stop", ({ chatId }) => {
    socket.to(String(chatId)).emit("user-stopped-typing", {
      userId: socket.userId,
      chatId,
    });
  });

  /* ================= READ RECEIPTS ================= */
  socket.on("message-read", ({ chatId, messageId }) => {
    socket.to(String(chatId)).emit("message-read", {
      messageId,
      userId: socket.userId,
      chatId,
    });
  });

  /* ================= DISCONNECT ================= */
  socket.on("disconnect", () => {
    if (socket.userId) {
      onlineUsers.delete(String(socket.userId));

      io.emit("online-users", Array.from(onlineUsers.keys()));
    }
  });
};