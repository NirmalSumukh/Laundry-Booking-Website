// backend/config/passport.js
// Google OAuth 2.0 strategy setup with passport-google-oauth20

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Serialize/deserialize for OAuth session support
passport.serializeUser((user, done) => {
  done(null, user.id); // Mongo _id
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-passwordHash');
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find or create user by Google profile
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Check if this email should be admin
          const adminEmails = [
            'admin@laundry.com',
            '' // Add your actual Gmail here
          ];
          
          const isAdmin = adminEmails.includes(profile.emails && profile.emails[0] ? profile.emails[0].value : '');
          
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName || 'Google User',
            email: profile.emails && profile.emails[0] ? profile.emails[0].value : undefined,
            role: isAdmin ? 'admin' : 'customer',
            isEmailVerified: true,
          });
          
          console.log(`Created new user: ${user.email} as ${user.role}`);
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);
