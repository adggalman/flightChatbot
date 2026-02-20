// For sec
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

// Import express
const express = require('express');

// Import mongoose
const mongoose = require('mongoose');

// Import CORS
const cors = require('cors');

// Import dotenv
require('dotenv').config();

// Import for auth
const passport = require('passport');
require('./middleware/auth');

// Create Express app
const app = express();

// Set security HTTP headers
app.use(helmet());

// Prevent HTTP parameter pollution
app.use(hpp());

// Rate limiting to prevent brute-force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api', limiter); // Apply limiter to all API routes

// Init passport
app.use(passport.initialize());

// Set up middleware
app.use(cors());
app.use(express.json());

// Set up routes
app.use('/api/health', require('./routes/health'));
app.use('/api/flights', require('./routes/flights'));
app.use('/api/chat', require('./routes/chat'));


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error', err));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;