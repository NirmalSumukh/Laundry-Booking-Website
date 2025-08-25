// backend/models/User.js
// User schema for local credentials and Google OAuth

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, index: true },
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    passwordHash: { type: String }, // for local login if used later
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    isEmailVerified: { type: Boolean, default: false },
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
