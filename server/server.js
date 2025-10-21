const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const setupSocketAuth = require("./middlewares/socketAuth");

// Import models
const User = require("./models/User");

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const chatRoutes = require("./routes/chat");
const marketRoutes = require("./routes/market");
const weatherRoutes = require("./routes/weather");
const productRoutes = require("./routes/product");

// Import socket handlers
const chatHandler = require("./socket/chatHandler");
const marketHandler = require("./socket/marketHandler");

// Import middlewares
const maintenanceMode = require("./middlewares/maintenance");
const {
  trackAnalytics,
  trackSessionStart,
  trackSessionEnd,
} = require("./middlewares/analytics");

// Import admin seeder
//const seedAdmin = require("./utils/seedAdmin");

dotenv.config();

const app = express();
const server = http.createServer(app);

// Allowed origins for CORS
const allowedOrigins = [
  "http://localhost:5173",
  "https://smart-farm-app.vercel.app",
  "https://smartfarm-app.onrender.com",
];

// CORS middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS error: Origin not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB and seed admin
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("MongoDB connected successfully!");
    //await seedAdmin(); // Create admin if not found
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS error: Origin not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST"],
  },
  transports: ["websocket"],
});

// Apply Socket.IO authentication middleware
setupSocketAuth(io);

// Handle Socket.IO connections
io.on("connection", (socket) => {
  console.log("User connected:", socket.id, "User:", socket.user?._id);

  socket.join(socket.user._id.toString());

  chatHandler(socket, io);
  marketHandler(socket, io);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Apply system middlewares
// app.use(maintenanceMode);
// app.use(trackAnalytics);
// app.use(trackSessionStart);

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/product", productRoutes);

// Gracefully track session end on shutdown
process.on("SIGINT", async () => {
  console.log("Server shutting down...");
  await trackSessionEnd();
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
