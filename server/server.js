require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const path = require("path");


const User = require("./models/user");

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const chatRoutes = require("./routes/chat");
const marketRoutes = require("./routes/market");
const weatherRoutes = require("./routes/weather");
const productRoutes = require("./routes/product");

// Import socket event handlers
const chatHandler = require("./socket/chatHandler");
const marketHandler = require("./socket/marketHandler");

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Setup Socket.IO with CORS and transports fallback
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["polling", "websocket"],
});

// Middleware
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("MongoDB connected!"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Improved auth middleware for REST routes
const authMiddleware = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      console.log("Authorization header missing or malformed");
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT payload:", decoded);

    if (!decoded.userId) {
      console.log("Token payload missing userId");
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      console.log("User not found with id:", decoded.userId);
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    if (!user.isActive) {
      console.log("User account is deactivated:", decoded.userId);
      return res.status(401).json({ message: "Account is deactivated" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// Socket.IO auth middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      console.log("Socket auth token missing");
      return next(new Error("Authentication error"));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Socket decoded JWT payload:", decoded);

    if (!decoded.userId) {
      console.log("Socket token missing userId");
      return next(new Error("Authentication error"));
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      console.log("Socket user not found:", decoded.userId);
      return next(new Error("Authentication error"));
    }

    if (!user.isActive) {
      console.log("Socket user account deactivated:", decoded.userId);
      return next(new Error("Authentication error"));
    }

    socket.user = user;
    next();
  } catch (error) {
    console.error("Socket auth error:", error);
    next(new Error("Authentication error"));
  }
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id, "User ID:", socket.user.id);

  // Join user room for private messaging
  socket.join(socket.user.id);

  // Socket event handlers
  chatHandler(socket, io);
  marketHandler(socket, io);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Mount routes (add authMiddleware in routes if routes require protection)
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/product", productRoutes);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
