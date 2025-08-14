require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/connectDb');
const configMiddlewares = require('./config/configMiddlewares');
const routes = require('./config/routes');
const http = require('http');
const { Server } = require('socket.io');
const setupSocket = require('./config/socket');

const app = express();

// Configure basic middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Configure security and other middlewares
configMiddlewares(app);

// Setup routes
routes(app);

// Connect to database
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Setup socket events
setupSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});