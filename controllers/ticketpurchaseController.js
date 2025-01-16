const Ticket = require('../models/ticketModel');
const Event = require('../models/eventModel');
const Purchase = require('../models/purchaseModel');
const Joi = require('joi');

// JOI schema for purchase validation
const purchaseSchema = Joi.object({
  ticketId: Joi.string().required().messages({
    'any.required': 'Ticket ID is required.',
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.min': 'Quantity must be at least 1.',
    'any.required': 'Quantity is required.',
  }),
});

// Purchase Ticket
exports.purchaseTicket = async (req, res) => {
  try {
    // Validate input
    const { error } = purchaseSchema.validate(req.body);
    if (error) {
      return res.status(422).json({ error: error.details[0].message });
    }

    const { ticketId, quantity } = req.body;

    // Fetch the ticket details
    const ticket = await Ticket.findById(ticketId).populate('event');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });

    const event = await Event.findById(ticket.event);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    // Check if the user is the organizer or an admin
    if (req.user.role === 'admin' || event.organizer.toString() === req.user.id) {
      return res.status(403).json({ message: 'Access denied. Organizers and admins cannot purchase tickets.' });
    }

    // Ensure there are enough tickets available
    if (ticket.quantity < quantity) {
      return res.status(400).json({ message: 'Not enough tickets available.' });
    }

    // Update the number of tickets sold and remaining quantity
    ticket.sold += quantity;
    ticket.quantity -= quantity;
    await ticket.save();

    // Record the purchase
    const purchase = new Purchase({
      user: req.user.id,
      ticket: ticketId,
      quantity,
      totalAmount: ticket.price * quantity,
      purchaseDate: Date.now(),
    });
    await purchase.save();

    res.status(201).json({ message: 'Ticket purchased successfully', purchase });
  } catch (error) {
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};
