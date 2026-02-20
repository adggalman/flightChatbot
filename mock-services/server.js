// For .env
require('dotenv').config()
const serviceAuth = require('./middleware/serviceAuth')

// Import express
const express = require('express');

// Import connectDB
const connectDB = require('./config/db');

// Create Express app
const app = express();

// Set up middleware
app.use(express.json());

// Set up routes
app.get('/health', (req, res) => res.json({status: 'ok'}));
app.use(serviceAuth)

app.use('/mock-api/booking', require('./routes/booking'));
app.use('/mock-api/flights', require('./routes/passengers'));

// Start the server
const PORT = process.env.PORT || 3001;
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);

    });
    
});

module.exports = app

