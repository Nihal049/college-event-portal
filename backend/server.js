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

// 3. Initialize Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Make sure this matches your frontend port
    methods: ["GET", "POST"]
  }
});

// 4. Standard Middlewares
app.use(cors());
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