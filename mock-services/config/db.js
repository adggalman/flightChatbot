// Connect Mongoose
const mongoose = require('mongoose');

let cached = null;

async function connectDB() {
    if (cached) return cached;
    try {
        cached = await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        return cached;
    } catch (err) {
        console.error('MongoDB connection error', err);
        // don't exit — let Vercel retry on next request
    }
}

module.exports = connectDB;
