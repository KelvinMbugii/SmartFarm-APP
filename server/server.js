const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const path = require('path');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chat');
const marketRoutes = require('./routes/market');
const weatherRoutes = require('./routes/weather');
const productRoutes = require('./routes/product');

// handlers
const chatHandler = require('./socket/chatHandler');
const marketHandler = require('./socket/marketHandler');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// connecting to mongodb
mongoose.connect(process.env.MONGODB_URL)
.then(() => console.log('Connected to mongodb'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/product', productRoutes);

// Socket.io connection handling
io.on('connection', (socket) =>{
    console.log('User connected:', socket.id);

    // Handle chat events
    chatHandler(socket, io);

    // Handle market events
    marketHandler(socket, io);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Starting the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
