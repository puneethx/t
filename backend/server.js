const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Suppress deprecation warnings
process.env.NODE_NO_WARNINGS = '1';

const authRoutes = require('./routes/auth');
const destinationRoutes = require('./routes/destinations');
const itineraryRoutes = require('./routes/itineraries');
const favoriteRoutes = require('./routes/favorites');
const reviewRoutes = require('./routes/reviews');
const groupRoutes = require('./routes/groups');
const adminRoutes = require('./routes/admin');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/traveltrove', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/destination-guides', destinationRoutes);
app.use('/api/v1/trip-itineraries', itineraryRoutes);
app.use('/api/v1/favorites', favoriteRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/groups', groupRoutes);
app.use('/api/v1/admin', adminRoutes);

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ message: 'TravelTrove API is running successfully' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`TravelTrove server running on port ${PORT}`);
});

module.exports = app;
