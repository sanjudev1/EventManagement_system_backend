const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, isAdmin } = require('../middleware/authMiddleware');

// Public routes
router.post('/user/signup', userController.registerUser);       // User signup
router.post('/signin', userController.login);              // Shared sign-in

// Admin-specific route for registering new admins
router.post('/admin/signup', userController.registerAdmin); // Admin signup

module.exports = router;
