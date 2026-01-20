require('dotenv').config({ path: '.env' });
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const compression = require('compression');

// Import configurations
const connectDB = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');
const { 
  limiter, 
  sanitize, 
  securityHeaders, 
  corsOptions,
  sanitizeInput 
} = require('./middleware/security');

// Import routes
const authRoutes = require('./routes/authRoutes');
const classroomRoutes = require('./routes/classroomRoutes');
const quizRoutes = require('./routes/quizRoutes');
const aiTutorRoutes = require('./routes/aiTutorRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Import socket handler
const { initializeSocketHandlers } = require('./socket/socketHandler');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: corsOptions,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Connect to database
connectDB();

// ==================== MIDDLEWARE ====================

// Security headers
app.use(securityHeaders);

// CORS
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Sanitize data
app.use(sanitize());
app.use(sanitizeInput);

// Rate limiting
app.use('/api/', limiter);

// Make io accessible to routes
app.set('io', io);

// ==================== ROUTES ====================

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EduVerse Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/ai-tutor', aiTutorRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/analytics', analyticsRoutes);

// API documentation route
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EduVerse API v1.0',
    documentation: '/api/docs',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        walletNonce: 'POST /api/auth/wallet/nonce',
        walletLogin: 'POST /api/auth/wallet/login',
        profile: 'GET /api/auth/me',
        updateProfile: 'PUT /api/auth/profile',
        linkWallet: 'POST /api/auth/link-wallet'
      },
      classrooms: {
        create: 'POST /api/classrooms/create',
        getAll: 'GET /api/classrooms',
        getOne: 'GET /api/classrooms/:id',
        join: 'POST /api/classrooms/:id/join',
        leave: 'POST /api/classrooms/:id/leave',
        myClassrooms: 'GET /api/classrooms/my/all'
      },
      quiz: {
        create: 'POST /api/quiz/create',
        start: 'POST /api/quiz/:id/start',
        submit: 'POST /api/quiz/:id/submit',
        results: 'GET /api/quiz/:id/results',
        certificate: 'POST /api/quiz/:id/certificate'
      },
      aiTutor: {
        ask: 'POST /api/ai-tutor',
        history: 'GET /api/ai-tutor/history',
        feedback: 'POST /api/ai-tutor/:id/feedback',
        generateQuiz: 'POST /api/ai-tutor/generate-quiz'
      },
      attendance: {
        mark: 'POST /api/attendance/mark',
        stats: 'GET /api/attendance/stats/:classroomId',
        myStats: 'GET /api/attendance/my-stats'
      },
      analytics: {
        leaderboard: 'GET /api/analytics/leaderboard',
        dashboard: 'GET /api/analytics/dashboard'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler (must be last)
app.use(errorHandler);

// ==================== SOCKET.IO ====================

initializeSocketHandlers(io);

// ==================== SERVER ====================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║                                                        ║');
  console.log('║            🎓 EduVerse Backend Server 🎓              ║');
  console.log('║                                                        ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode`);
  console.log(`📡 API Server: http://${process.env.HOST || 'localhost'}:${PORT}`);
  console.log(`🔌 Socket.IO: ws://${process.env.HOST || 'localhost'}:${PORT}`);
  console.log(`📚 API Docs: http://${process.env.HOST || 'localhost'}:${PORT}/api`);
  console.log(`💚 Health Check: http://${process.env.HOST || 'localhost'}:${PORT}/health`);
  console.log('');
  console.log('Available Endpoints:');
  console.log('  - Authentication: /api/auth');
  console.log('  - Classrooms: /api/classrooms');
  console.log('  - Quizzes: /api/quiz');
  console.log('  - AI Tutor: /api/ai-tutor');
  console.log('  - Attendance: /api/attendance');
  console.log('  - Analytics: /api/analytics');
  console.log('');
  console.log('Press Ctrl+C to stop the server');
  console.log('════════════════════════════════════════════════════════');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };
