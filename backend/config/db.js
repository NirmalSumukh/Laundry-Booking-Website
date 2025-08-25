// backend/config/db.js
// MongoDB connection using Mongoose

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || ''; // ADD your DB localhost server link
    await mongoose.connect(uri, {
      // Mongoose 6+ no need for many old options
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connect error:', err.message);
    process.exit(1);
  }
};

module.exports = { connectDB };
