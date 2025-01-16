const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');

// Import routes
const userRoutes = require('./routes/userRoutes');
const movieRoutes = require('./routes/movieRoutes');
const bookRoutes = require('./routes/bookRoutes');  
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoute');
const ticketRoutes = require('./routes/ticketRoute')
const ticketpurchaseRoutes = require('./routes/ticketpurchaseRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const imageRoutes = require('./routes/imageRoute');
// dotenv files loaded
dotenv.config();

// Initialize Express app 
const app = express();

// MongoDB connection
connectDB();
// Middleware
app.use(bodyParser.json()); // Parse incoming JSON requests


// Routes
app.use('/api/all', userRoutes); 
app.use('/api/auth',authRoutes);
app.use('/api/movies', movieRoutes); 
app.use('/api/books', bookRoutes);  
app.use('/api/events', eventRoutes);
app.use('/api/tickets',ticketRoutes);
app.use('/api/purchase',ticketpurchaseRoutes);
app.use('/api/reviews',reviewRoutes);
app.use('/api/image',imageRoutes)


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
