const User = require("../models/user");

// userId -> connectionCount
const connections = new Map();

async function emitOnlineUsers(io) {
  try {
    const onlineIds = Array.from(connections.entries())
      .filter(([, count]) => count > 0)
      .map(([id]) => id);

    if (onlineIds.length === 0) {
      io.emit("presence:online-users", []);
      return;
    }

    const users = await User.find({ _id: { $in: onlineIds } })
      .select("name role avatar isOnline LastSeen")
      .sort({ name: 1 });

    const payload = users.map((u) => {
      const obj = u.toObject();
      return {
        id: obj._id,
        _id: obj._id,
        name: obj.name,
        role: obj.role,
        avatar: obj.avatar,
        isOnline: true,
        lastSeen: obj.LastSeen || obj.lastSeen,
      };
    });

    io.emit("presence:online-users", payload);
  } catch (e) {
    // fail silently; presence is a best-effort feature
  }
}

async function emitOnlineUsersToSocket(socket) {
  try {
    const io = socket.nsp;
    const onlineIds = Array.from(connections.entries())
      .filter(([, count]) => count > 0)
      .map(([id]) => id);

    if (onlineIds.length === 0) {
      socket.emit("presence:online-users", []);
      return;
    }

    const users = await User.find({ _id: { $in: onlineIds } })
      .select("name role avatar isOnline LastSeen")
      .sort({ name: 1 });

    const payload = users.map((u) => {
      const obj = u.toObject();
      return {
        id: obj._id,
        _id: obj._id,
        name: obj.name,
        role: obj.role,
        avatar: obj.avatar,
        isOnline: true,
        lastSeen: obj.LastSeen || obj.lastSeen,
      };
    });

    socket.emit("presence:online-users", payload);
  } catch (e) {
    // ignore
  }
}

module.exports = (socket, io) => {
  const userId = socket.user?._id?.toString();
  if (!userId) return;

  connections.set(userId, (connections.get(userId) || 0) + 1);

  // Mark online (no full validation)
  User.findByIdAndUpdate(userId, { isOnline: true }).catch(() => {});

  // Broadcast latest presence list
  emitOnlineUsers(io);

  socket.on("presence:request", () => emitOnlineUsersToSocket(socket));

  socket.on("disconnect", async () => {
    const next = (connections.get(userId) || 1) - 1;
    if (next <= 0) {
      connections.delete(userId);
      try {
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          LastSeen: new Date(),
        });
      } catch (e) {
        // ignore
      }
    } else {
      connections.set(userId, next);
    }
    emitOnlineUsers(io);
  });
};

