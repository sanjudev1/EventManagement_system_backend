const express = require('express');
const { purchaseTicket } = require('../controllers/ticketpurchaseController');
const { auth } = require('../middleware/authMiddleware');

const router = express.Router();

// Purchase ticket route (protected by authentication middleware)
router.post('/tickets', auth, purchaseTicket);

module.exports = router;
