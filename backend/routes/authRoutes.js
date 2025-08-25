// backend/routes/authRoutes.js
// Auth endpoints: signup/login (optional), Google OAuth flow

const router = require('express').Router();
const passport = require('passport');
const { signup, login, googleSuccess } = require('../controllers/authController');

// Local endpoints (optional)
router.post('/signup', signup);
router.post('/login', login);

// Google OAuth start
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' })
);

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  googleSuccess
);

module.exports = router;
