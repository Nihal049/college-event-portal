const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// 1. Initialize environment variables and database FIRST
dotenv.config();
connectDB();

// 2. Initialize the Express app
const app = express();
const server = http.createServer(app);

// 3. CRITICAL FIX: Initialize Socket.io with production CORS & Transports
const io = new Server(server, {
  cors: {
    origin: "*", // Allows connections from anywhere (Localhost, Vercel, Render, etc.)
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'] // Forces WebSockets for Render compatibility
});

// 4. CRITICAL FIX: Standard Middlewares updated for production CORS
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// 5. Inject 'io' into req so controllers can access it
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 6. Routes 
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));

// 7. Listen for client socket connections
io.on('connection', (socket) => {
  console.log(`⚡ A user connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

// 8. Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});