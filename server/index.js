const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const bookingRoutes = require('./routes/bookings');
const providerRoutes = require('./routes/providers');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payments');
const reviewRoutes = require('./routes/reviews');

const { initializeDatabase } = require('./config/database');
const { setupSocketHandlers } = require('./socket/handlers');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'HouseMate API is running', timestamp: new Date().toISOString() });
});

// Socket.IO setup
setupSocketHandlers(io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Initialize database and start server
initializeDatabase().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 HouseMate Server running on port ${PORT}`);
    console.log(`🏠 Serving Vijayawada, Andhra Pradesh`);
    console.log(`💰 Currency: Indian Rupees (₹)`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

module.exports = { app, io };