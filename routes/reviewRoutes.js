const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const {auth} = require('../middleware/authMiddleware'); // Middleware for authentication

// Create a review
router.post('/create', auth, reviewController.createReview);

// Get all reviews for a specific event
router.get('/:eventId', auth,reviewController.getReviewsByEvent);

// Update a review
router.put('/:id', auth, reviewController.updateReview);

// Delete a review
router.delete('/:id', auth, reviewController.deleteReview);

module.exports = router;
