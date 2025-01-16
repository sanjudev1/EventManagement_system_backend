const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

// Get all books
router.get('/', bookController.getBooks);

// Create a new book
router.post('/', bookController.createBook);

module.exports = router;
