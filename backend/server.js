const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const logger = require('./utils/logger');
const dotenv = require('dotenv');
const app = express();
const panchangRoutes = require('./routes/panchangRoutes');
dotenv.config();

app.use(express.json());
const port = process.env.PORT || 4000;

// CORS Configuration
app.use(cors({
    origin: '*', // Allow all origins (can be restricted for production)
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Specify allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
}));

// Logger Middleware
app.use(morgan('combined'));

// Routes
app.use('/api', panchangRoutes);

// Start Server
app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
});
