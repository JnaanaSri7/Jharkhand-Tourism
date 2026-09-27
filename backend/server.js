require('dotenv').config({ path: require('path').join(__dirname, '.env') });
try {
  require('dns').setServers(['8.8.8.8', '8.8.4.4']);
} catch (err) {
  // Custom DNS servers not supported or restricted in serverless environment
}
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { spawn } = require('child_process');
const path = require('path');
const { connectDB } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const placesRoutes = require('./routes/places');
const imagesRoutes = require('./routes/images');
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');
const chatbotRoutes = require('./routes/chatbot');
const travelPlannerRoutes = require('./routes/travelPlanner');

const app = express();
app.set('trust proxy', 1);

// Chatbot service is now integrated directly with Gemini API
console.log('🤖 Chatbot service integrated with Gemini API');

// Keep the process health check available even when MongoDB is unreachable.
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Jharkhand Tourism API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database middleware to ensure connection on serverless requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('MongoDB connection middleware error:', err.message);
    next();
  }
});

// Security middleware with relaxed CSP for images
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:", "*"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:3000", "http://localhost:3001"]
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001'
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression middleware
app.use(compression());

// Rate limiting - generous for development and serverless
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // increased limit for development
  validate: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/api/places', placesRoutes);
app.use('/api/images', imagesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/travel-planner', travelPlannerRoutes);

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Jharkhand Tourism API Documentation',
    endpoints: {
      places: {
        'POST /api/places/upload': 'Upload places.js file',
        'GET /api/places': 'Get all places with optional filtering',
        'GET /api/places/district/:district': 'Get places by district',
        'GET /api/places/nearby': 'Get nearby places (requires lat, lon query params)',
        'GET /api/places/download/js': 'Download places data as JavaScript file',
        'GET /api/places/:id': 'Get single place by ID'
      },
      images: {
        'POST /api/images/upload': 'Upload multiple images',
        'GET /api/images': 'Get all images metadata',
        'GET /api/images/:id': 'Get image by ID',
        'GET /api/images/download/:filename': 'Download image by filename',
        'GET /api/images/place/:placeId': 'Get images for specific place',
        'DELETE /api/images/:id': 'Delete image by ID'
      },
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'Login user',
        'GET /api/auth/profile': 'Get user profile (requires auth)',
        'PUT /api/auth/profile': 'Update user profile (requires auth)',
        'PUT /api/auth/change-password': 'Change password (requires auth)',
        'POST /api/auth/logout': 'Logout user (requires auth)'
      },
      payment: {
        'POST /api/payment/process': 'Process payment with blockchain integration',
        'GET /api/payment/blockchain/:transactionHash': 'Get blockchain transaction details',
        'GET /api/payment/blockchain/stats': 'Get blockchain statistics'
      },
      chatbot: {
        'POST /api/chatbot/message': 'Send message to AI chatbot',
        'GET /api/chatbot/health': 'Check chatbot service health'
      },
      travelPlanner: {
        'POST /api/travel-planner/generate': 'Generate AI-powered travel itinerary',
        'GET /api/travel-planner/destinations': 'Get popular Jharkhand destinations',
        'GET /api/travel-planner/health': 'Check travel planner service health'
      }
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Jharkhand Tourism API',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM. Shutting down gracefully...');
  process.exit(0);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Jharkhand Tourism API Server running on port ${PORT}`);
    console.log(`📖 API Documentation: http://localhost:${PORT}/api/docs`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🤖 Chatbot API: http://localhost:${PORT}/api/chatbot/health`);
    console.log(`✈️ Travel Planner API: http://localhost:${PORT}/api/travel-planner/health`);
  });
}

module.exports = app;

