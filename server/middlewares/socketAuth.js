const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      // 🔍 Log incoming token for debugging
      console.log("Socket.IO auth attempt. Token:", token ? "Present" : "Missing");

      if (!token) {
        console.warn("Socket.IO auth failed: No token provided");
        return next(new Error("Authentication token missing"));
      }

      // 🔐 Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded || !decoded.userId) {
        console.warn("Socket.IO auth failed: Invalid token payload");
        return next(new Error("Invalid token payload"));
      }

      // 👤 Find user in DB
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        console.warn("Socket.IO auth failed: User not found");
        return next(new Error("User not found"));
      }

      // ✅ Attach user to socket
      socket.user = user;
      console.log(`Socket.IO auth success. User: ${user._id}`);
      next();
    } catch (err) {
      console.error("Socket.IO auth error:", err.message);
      next(new Error("Authentication error"));
    }
  });
};
