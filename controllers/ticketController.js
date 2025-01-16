const Ticket = require('../models/ticketModel');
const Event = require('../models/eventModel');
const Joi = require('joi');

// JOI schema for ticket creation
const ticketCreationSchema = Joi.object({
  eventId: Joi.string().required().messages({
    'any.required': 'Event ID is required.',
  }),
  type: Joi.string().min(3).required().messages({
    'string.min': 'Ticket type should be at least 3 characters long.',
    'any.required': 'Ticket type is required.',
  }),
  price: Joi.number().positive().required().messages({
    'number.positive': 'Price should be a positive number.',
    'any.required': 'Price is required.',
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.min': 'Quantity must be at least 1.',
    'any.required': 'Quantity is required.',
  }),
});

// JOI schema for ticket update
const ticketUpdateSchema = Joi.object({
  type: Joi.string().min(3),
  price: Joi.number().positive(),
  quantity: Joi.number().integer().min(1),
});

// Create Ticket
exports.createTicket = async (req, res) => {
  try {
    // Validate input
    const { error } = ticketCreationSchema.validate(req.body);
    if (error) {
      return res.status(422).json({ error: error.details[0].message });
    }

    const { eventId, type, price, quantity } = req.body;
    const event = await Event.findById(eventId);
  
    if (!event) return res.status(404).json({ message: 'Event not found' });
  
    // Check if user is the organizer or an admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only the event organizer or an admin can create tickets for this event.' });
    }
  
    // Check if a ticket of the same type already exists for this event
    const existingTicket = await Ticket.findOne({ event: eventId, type });
    if (existingTicket) {
      return res.status(400).json({ message: `A ticket of type '${type}' already exists for this event.` });
    }
  
    // Create a new ticket if no duplicate was found
    const ticket = new Ticket({ event: eventId, type, price, quantity, creator: req.user.id });
    await ticket.save();
  
    res.status(201).json({ message: 'Ticket created successfully', ticket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all tickets for an event
exports.getTicketsByEvent = async (req, res) => {
  try {
    const tickets = await Ticket.find({ event: req.params.eventId });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Ticket
exports.updateTicket = async (req, res) => {
  try {
    // Validate input
    const { error } = ticketUpdateSchema.validate(req.body);
    if (error) {
      return res.status(422).json({ error: error.details[0].message });
    }

    const { type, price, quantity } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
  
    const event = await Event.findById(ticket.event);
    if (!event) return res.status(404).json({ message: 'Associated event not found' });
  
    // Check if user is the organizer or an admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only the event organizer or an admin can update tickets for this event.' });
    }
  
    // Check if a ticket of the same type already exists for this event (if type is being updated)
    if (type && type !== ticket.type) {
      const existingTicket = await Ticket.findOne({ event: ticket.event, type });
      if (existingTicket) {
        return res.status(400).json({ message: `A ticket of type '${type}' already exists for this event.` });
      }
    }
  
    // Update the ticket fields
    ticket.type = type || ticket.type;
    ticket.price = price || ticket.price;
    ticket.quantity = quantity || ticket.quantity;
    await ticket.save();
  
    res.json({ message: 'Ticket updated successfully', ticket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
