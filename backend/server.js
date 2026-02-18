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