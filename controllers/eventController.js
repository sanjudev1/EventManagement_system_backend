const Event = require('../models/eventModel');
const Joi = require('joi');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 60 ,checkperiod: 120});

// JOI schema for event creation and updating
const eventSchema = Joi.object({
  title: Joi.string().min(3).max(100).required().messages({
    'string.min': 'Title must be at least 3 characters long.',
    'string.max': 'Title cannot exceed 100 characters.',
    'any.required': 'Title is required.'
  }),
  description: Joi.string().max(1000).required().messages({
    'string.max': 'Description cannot exceed 1000 characters.',
    'any.required': 'Description is required.'
  }),
  date: Joi.date().iso().greater('now').required().messages({
    'date.format': 'Date must be in ISO format.',
    'date.greater': 'Date must be in the future.',
    'any.required': 'Date is required.'
  }),
  location: Joi.string().min(5).max(255).required().messages({
    'string.min': 'Location must be at least 5 characters long.',
    'string.max': 'Location cannot exceed 255 characters.',
    'any.required': 'Location is required.'
  }),
  category: Joi.string().valid('Music', 'Sports', 'Education', 'Tech', 'Health', 'Business').required().messages({
    'any.only': 'Category must be one of Music, Sports, Education, Tech, Health, or Business.',
    'any.required': 'Category is required.'
  })
});

// Create Event
exports.createEvent = async (req, res) => {
  try {
    // Validate input
    const { error } = eventSchema.validate(req.body);
    if (error) return res.status(422).json({ error: error.details[0].message });

    const { title, description, date, location, category } = req.body;
    const event = new Event({
      title,
      description,
      date,
      location,
      category,
      organizer: req.user.id
    });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('organizer', 'username');
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get an event by ID
exports.getEventById = async (req, res) => {
  const eventId = req.params.id
  try {
    let cache_event = cache.get(eventId);
    if (cache_event) {
      cache.ttl(eventId, 200); 
      return res.json({ source: 'cache', data: cache_event });
    }
    const event = await Event.findById(eventId).populate('organizer', 'username');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    cache.set(eventId, event);
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Event
exports.updateEvent = async (req, res) => {
  try {
    // Validate input
    const { error } = eventSchema.validate(req.body);
    if (error) return res.status(422).json({ error: error.details[0].message });

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Check if the user is the organizer or an admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You are not authorized to update this event.' });
    }

    // Proceed with the update if authorized
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete Event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Check if the user is the organizer or an admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only the organizer or an admin can delete this event.' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
