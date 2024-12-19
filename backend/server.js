const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const logger = require('./utils/logger');
const dotenv = require('dotenv');
const panchangRoutes = require('./routes/panchangRoutes');
const newRoutes = require('./routes/newRoutes');

dotenv.config();

const app = express();

// Middleware for parsing JSON requests
app.use(express.json());


const allowedOrigins = ['http://localhost:3000', 'https://panchang-ten.vercel.app'];

const corsOption = {
    origin:allowedOrigins, // allowed origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // allowed methods
    credentials: true, // allow credentials (cookies, authorization headers, etc.)
  };
  
  app.use(cors(corsOption)); // apply CORS middleware


// Logger Middleware for detailed logs
app.use(morgan('combined'));

// Routes
app.use('/api', panchangRoutes);


// Error Handling Middleware
app.use((err, req, res, next) => {
    logger.error(err.message || 'Internal Server Error');
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
    });
});

// Port Configuration
const port = process.env.PORT || 4000;

// Start the server
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});

// Export app for serverless environment (if needed)
module.exports = app;
