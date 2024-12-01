const express = require('express');
const cors = require('cors'); // Import the cors package
const morgan = require('morgan'); // Import the morgan package
const logger = require('./utils/logger'); // Import the logger
const dotenv = require('dotenv');
const app = express();
const panchangRoutes = require('./routes/panchangRoutes');
dotenv.config();

app.use(express.json());
const port = process.env.PORT || 4000;
const geoUsername = process.env.GEO_USERNAME || ucs05;
// CORS Configuration
app.use(cors({
    origin: '*', // Allow requests from any origin
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Specify allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
}));

app.use('/api', panchangRoutes);     
// Logger Middleware
app.use(morgan('combined')); // Use 'combined' for detailed logs


app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
});
