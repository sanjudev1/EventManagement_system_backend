const Review = require('../models/reviewModel');
const Event = require('../models/eventModel');
const Joi = require('joi');

// JOI schema for review creation
const reviewCreationSchema = Joi.object({
    eventId: Joi.string().required().messages({
        'any.required': 'Event ID is required.'
    }),
    rating: Joi.number().integer().min(1).max(5).required().messages({
        'number.min': 'Rating must be at least 1.',
        'number.max': 'Rating cannot exceed 5.',
        'any.required': 'Rating is required.'
    }),
    content: Joi.string().max(500).required().messages({
        'string.max': 'Content must be at most 500 characters long.',
        'any.required': 'Review content is required.'
    })
});

// JOI schema for review update
const reviewUpdateSchema = Joi.object({
    rating: Joi.number().integer().min(1).max(5).messages({
        'number.min': 'Rating must be at least 1.',
        'number.max': 'Rating cannot exceed 5.'
    }),
    content: Joi.string().max(500).messages({
        'string.max': 'Content must be at most 500 characters long.'
    })
});

// Create a review
exports.createReview = async (req, res) => {
    try {
        // Validate input
        const { error } = reviewCreationSchema.validate(req.body);
        if (error) return res.status(422).json({ error: error.details[0].message });

        const { eventId, rating, content } = req.body;
        
        // Verify the event exists
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Check if the user is the organizer or an admin
        if (req.user.role === 'admin' || event.organizer.toString() === req.user.id) {
            return res.status(403).json({ message: 'Access denied. Organizers and admins cannot give reviews.' });
        }

        // Create the review
        const review = new Review({
            event: eventId,
            user: req.user.id,
            rating,
            content
        });
        await review.save();

        res.status(201).json({ message: 'Review created successfully', review });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all reviews for an event
exports.getReviewsByEvent = async (req, res) => {
    try {
        const reviews = await Review.find({ event: req.params.eventId }).populate('user', 'name');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a review
exports.updateReview = async (req, res) => {
    try {
        // Validate input
        const { error } = reviewUpdateSchema.validate(req.body);
        if (error) return res.status(422).json({ error: error.details[0].message });

        const { rating, content } = req.body;

        // Find the review by ID and ensure the requesting user is the author
        const review = await Review.findOne({ _id: req.params.id, user: req.user.id }).populate('event');
        if (!review) return res.status(404).json({ message: 'Review not found or unauthorized' });

        const event = review.event;

        // Check if the user is an organizer or admin
        if (req.user.role === 'admin' || event.organizer.toString() === req.user.id) {
            return res.status(403).json({ message: 'Access denied. Organizers and admins cannot give reviews.' });
        }

        // Update the review fields
        if (rating) review.rating = rating;
        if (content) review.content = content;
        await review.save();

        res.json({ message: 'Review updated successfully', review });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a review
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!review) return res.status(404).json({ message: 'Review not found or unauthorized' });

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
