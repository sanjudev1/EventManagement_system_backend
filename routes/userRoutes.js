const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {auth,isAdmin} = require('../middleware/authMiddleware')

// Get all users

router.get('/users', auth, userController.getAllUsers);

// Get all admins - only accessible by admins
router.get('/admins', auth,isAdmin, userController.getAllAdmins);

module.exports = router;

