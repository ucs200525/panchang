const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const logger = require('./utils/logger');
const dotenv = require('dotenv');
const panchangRoutes = require('./routes/panchangRoutes');

dotenv.config();

const app = express();

// Middleware for parsing JSON requests
app.use(express.json());

// CORS Configuration (restrict origins for production)
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['*']; // In production, list specific domains

app.use(cors({
    origin: function (origin, callback) {
        if (allowedOrigins.includes('*') || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

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
