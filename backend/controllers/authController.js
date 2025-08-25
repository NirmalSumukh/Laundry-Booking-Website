// backend/controllers/authController.js
// Local JWT issue after OAuth or future local login. Google OAuth routes in authRoutes.

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Issue JWT for a user
const issueToken = (user) => {
  const payload = {
    sub: user._id.toString(),
    role: user.role,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev_jwt_secret_change_me', {
    expiresIn: '7d',
  });
  return token;
};

// Example local signup (optional)
const signup = async (req, res, next) => {
  try {
    const { name, email, password, address } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already used' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      passwordHash: hash,
      role: 'customer',
      isEmailVerified: false,
      address,
    });

    return res.status(201).json({ message: 'Signup success', userId: user._id });
  } catch (err) {
    next(err);
  }
};

// Example local login (optional)
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) return res.status(400).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const token = issueToken(user);
    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    next(err);
  }
};

// Called after Google OAuth success to issue JWT for SPA/API usage
const googleSuccess = async (req, res) => {
  const token = issueToken(req.user);
  
  // Store token in session temporarily for frontend pickup
  req.session.tempToken = token;
  
  // Redirect based on user role
  if (req.user.role === 'admin') {
    return res.redirect('/admin-dashboard');
  } else {
    return res.redirect('/customer-dashboard');
  }
};

module.exports = { signup, login, googleSuccess };
