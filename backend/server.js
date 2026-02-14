// Import express
const express = require('express');

// Import mongoose
const mongoose = require('mongoose');

// Import CORS
const cors = require('cors');

// Import dotenv
require('dotenv').config();

// Create Express app
const app = express();

// Set up middleware
app.use(cors());
app.use(express.json());

// Set up routes
app.use('/api/health', require('./routes/health'));
app.use('/api/flights', require('./routes/flights'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error', err));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});