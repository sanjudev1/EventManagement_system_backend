const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/userModel');

// JOI schema for validating the Authorization header format
const authHeaderSchema = Joi.string().pattern(/^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$/);

// Authentication Middleware
exports.auth = async (req, res, next) => {
  const token = req.header('Authorization');
  
  // Validate token format
  const { error } = authHeaderSchema.validate(token);
  if (error) {
    return res.status(401).json({ message: 'Access denied. Invalid token format.' });
  }
  
  const bearerToken = token.split(' ')[1];
  try {
    const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);
    
    // Verify if user exists 
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    
    req.user = decoded; // Attach user info to request
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please log in again.' });
    } else {
      return res.status(400).json({ message: 'Invalid token.' });
    }
  }
};

// Middleware to restrict access to admin users

exports.isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};
