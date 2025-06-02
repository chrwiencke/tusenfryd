const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.authToken || req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      if (req.path.startsWith('/api/')) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
      }
      return res.redirect('/admin/login');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      if (req.path.startsWith('/api/')) {
        return res.status(401).json({ error: 'Invalid token or user not active.' });
      }
      res.clearCookie('authToken');
      return res.redirect('/admin/login');
    }

    req.user = user;
    next();
  } catch (error) {
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    res.clearCookie('authToken');
    res.redirect('/admin/login');
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.authToken || req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch (error) {
    // Ignore errors for optional auth
  }
  
  next();
};

module.exports = { auth, optionalAuth };
