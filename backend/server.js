const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();
// Mongoose global settings: fail fast when DB is unreachable
mongoose.set('bufferCommands', false);

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
let MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/polling-system';
// Normalize localhost to 127.0.0.1 to avoid IPv6/hosts issues on Windows
if (MONGODB_URI.startsWith('mongodb://') && MONGODB_URI.includes('localhost')) {
  MONGODB_URI = MONGODB_URI.replace('localhost', '127.0.0.1');
}

const mongooseOptions = {
  serverSelectionTimeoutMS: 5000,
  family: 4 // force IPv4
};

// For direct local connection (non-SRV), this can help skip topology discovery
if (MONGODB_URI.startsWith('mongodb://')) {
  mongooseOptions.directConnection = true;
}

// Enable insecure TLS only if explicitly requested (useful for corp proxies/SSL MITM in dev)
if ((process.env.MONGODB_TLS_INSECURE || '').toLowerCase() === 'true') {
  mongooseOptions.tlsAllowInvalidCertificates = true;
  mongooseOptions.sslValidate = false;
}

mongoose.connect(MONGODB_URI, mongooseOptions)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err?.message || err);
});

mongoose.connection.on('disconnected', () => {
  console.error('Mongoose disconnected');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/polls', require('./routes/polls'));
app.use('/api/votes', require('./routes/votes'));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-poll', (pollId) => {
    socket.join(`poll-${pollId}`);
    console.log(`User ${socket.id} joined poll ${pollId}`);
  });

  socket.on('leave-poll', (pollId) => {
    socket.leave(`poll-${pollId}`);
    console.log(`User ${socket.id} left poll ${pollId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

