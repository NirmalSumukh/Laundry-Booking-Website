// backend/app.js
// Express app configuration: middleware, view engine (EJS), routes, and static assets.

const path = require('path');
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session'); // For Passport session only for Google OAuth flow
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '.env') });

const { connectDB } = require('./config/db');
require('./config/passport'); // Initialize passport strategies

const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Connect to MongoDB
connectDB();

// EJS view engine setup (views directory at backend/views)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'frontend', 'public', 'views'));

// Static files (serve frontend public if desired or a shared public)
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

// Core middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Minimal session for Passport Google (does not store app auth, only OAuth handshake)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'temp_secret_change_me',
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Health route
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Render index.ejs — landing page
app.get('/', (req, res) => {
  // Example dynamic data passed to EJS
  res.render('index', {
    title: 'Laundry Booking',
    loggedIn: !!req.user,
    user: req.user || null,
  });
});

// Add these routes after your existing '/' route in backend/app.js

// Login page route
app.get('/login', (req, res) => {
  res.render('login', {
    title: 'Login - Laundry Booking',
    loggedIn: !!req.user,
    user: req.user || null,
  });
});

// Customer dashboard route (protected)
app.get('/customer-dashboard', (req, res) => {
  if (!req.user) {
    return res.redirect('/login');
  }
  res.render('customer-dashboard', {
    title: 'My Orders - Laundry Booking',
    loggedIn: true,
    user: req.user,
  });
});

// Admin dashboard route (protected, admin only)
app.get('/admin-dashboard', (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.redirect('/login');
  }
  res.render('admin-dashboard', {
    title: 'Admin Panel - Laundry Booking',
    loggedIn: true,
    user: req.user,
  });
});

app.get('/api/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Session destroy failed' });
      }
      res.redirect('/');
    });
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
