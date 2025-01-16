const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const {auth,isAdmin} = require('../middleware/authMiddleware')


// Create an event 

router.post('/create', auth, eventController.createEvent);

router.get('/all', auth,eventController.getAllEvents);

// Get a specific event by ID
router.get('/:id', auth,eventController.getEventById);

// Update an event
router.put('/:id', auth, eventController.updateEvent);

// Delete an event
router.delete('/:id', auth, eventController.deleteEvent);


module.exports = router;