const dotenv = require("dotenv");
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

// dotenv
dotenv.config();

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Setup Socket.IO with CORS and transports fallback

const allowedOrigins = [
  "http://localhost:5173",
  "https://smart-farm-app.vercel.app",
  "https://smartfarm-app.onrender.com",
];

const normalizeOrigin = (origin) =>
  origin?.replace(/\/$/, "").toLowerCase()

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin ) return callback(null, true);
      const normalizedOrigin = path.normalizeOrigin(origin);
      const allowed = allowedOrigins.some(
        (allowedOrigin) => normalizeOrigin(allowedOrigin === normalizedOrigin)
      );
      if(allowed) {
        callback(null, true);
      }
      else {
        console.log("Blocked CORS Origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    //origin: CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["polling", "websocket"],
});

//JWT auth middleware for sockets
io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];
    console.log("Received Token:", token);
    if (!token) {
      return next(new Error("Authentication token missing"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      console.log("User not Found");
      return next(new Error("Authentication error: Invalid user"));
    }

    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

// Middleware
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      else cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: "Content-Type, Authorization",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected!"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id, "User:", socket.user._id);

  // Join user room for private messaging
  socket.join(socket.user._id.toString());

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
