const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { sequelize } = require('./models');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet()); // Security headers

// CORS configuration - Allow all origins for development/testing
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  maxAge: 86400 // Cache preflight for 24 hours
}));

app.use(morgan('combined')); // Logging

// Increase payload limits for file uploads
app.use(express.json({ limit: '50mb' })); // Increase JSON limit
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Increase URL-encoded limit

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Udupiyar Operations Backend is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/production', require('./routes/production'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/batch-code-print', require('./routes/batchCodePrint'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/batch-code-data', require('./routes/batchCodeData'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler - must be last middleware
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Sync database (creates tables if they don't exist)
    await sequelize.sync({ force: false });
    console.log('✅ Database synchronized.');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;