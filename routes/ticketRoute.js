const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const {auth} = require('../middleware/authMiddleware');

// Create a new ticket for an event
router.post('/create', auth, ticketController.createTicket);

// Get tickets by event ID
router.get('/event/:eventId', auth,ticketController.getTicketsByEvent);

// Update ticket information (e.g., mark ticket as sold)
router.put('/:id', auth, ticketController.updateTicket);

module.exports = router;

