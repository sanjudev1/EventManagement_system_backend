const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Joi = require('joi');

// Validation Schemas
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});  
   
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});

// User Registration
exports.registerUser = async (req, res) => {
  try {  
    // Validate input
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(422).json({ error: error.details[0].message });

    const { username, email, password } = req.body;

    // Check if username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      const errorMessage = existingUser.username === username 
        ? 'Username is already taken' 
        : 'Email is already registered';
      return res.status(409).json({ error: errorMessage });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, role: 'user' });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
};

// Admin Registration
exports.registerAdmin = async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(422).json({ error: error.details[0].message });

    const { username, email, password } = req.body;

    // Check if username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      const errorMessage = existingUser.username === username 
        ? 'Username is already taken' 
        : 'Email is already registered';
      return res.status(409).json({ error: errorMessage });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new User({ username, email, password: hashedPassword, role: 'admin' });
    await admin.save();

    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
};

// User and Admin Login
exports.login = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(422).json({ error: error.details[0].message });

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({role:'user'});
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
};

// Get all admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' });
    res.status(200).json(admins);
  } catch (err) {
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
};
