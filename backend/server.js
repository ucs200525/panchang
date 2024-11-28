const express = require('express');
const fetch = require('node-fetch'); // Make sure to install node-fetch if you haven't already
const cors = require('cors'); // Import the cors package
const morgan = require('morgan'); // Import the morgan package
const logger = require('./utils/logger'); // Import the logger

const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();


app.use(express.json());

// CORS Configuration
app.use(cors({
    origin: '*', // Allow requests from any origin
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Specify allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
}));

// Logger Middleware
app.use(morgan('combined')); // Use 'combined' for detailed logs

// Function to fetch coordinates and time zone based on the city name
async function fetchCoordinates(city) {
    const apiKey = '699522e909454a09b82d1c728fc79925'; // Your API key
    try {
        const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)}&key=${apiKey}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if (data.results.length > 0) {
            const {limit , remaining , reset } = data.rate;
            logger.info("limit , remaining , reset :"+limit + remaining + reset);
            const { lat, lng } = data.results[0].geometry;
            const timeZone = data.results[0].annotations.timezone.name;
            logger.error('get lang lat time : ' +  lat+ lng+ timeZone);
            return { lat, lng, timeZone ,limit , remaining , reset}; // Return all required values
        } else {
            throw new Error('City not found');
        }
    } catch (error) {
        logger.error('Error fetching coordinates: ' + error.message);
        return null; 
    }
}

async function fetchCityName(lat, lng) {
    const apiKey = '699522e909454a09b82d1c728fc79925'; // Your API key
    try {
        const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(lat)},${encodeURIComponent(lng)}&key=${apiKey}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if (data.results.length > 0) {
            const { limit, remaining, reset } = data.rate;
            logger.info("limit, remaining, reset:"+ limit+ remaining+ reset);
            const components = data.results[0].components;
            const city = components.city || components.town || components.village || 'Unknown city';
            const timeZone = data.results[0].annotations.timezone.name;
            return { cityName: city, timeZone,limit, remaining, reset }; // Return city name and time zone
        } else {
            throw new Error('Location not found');
        }
    } catch (error) {
        logger.error('Error fetching city name: ' + error.message);
        return null;
    }
}


// Function to convert UTC time to local time based on time zone
const convertToLocalTime = (utcDate, timeZone) => {
    const date = new Date(utcDate);
    return date.toLocaleString('en-US', { timeZone, hour12: false }).split(' ')[1];
};

// Function to fetch sunrise and sunset times for a given date
async function fetchSunTimes(lat, lng, date, timeZone) {
    try {
        const response = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0&date=${date}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        const results = data.results;

        // Log the sunrise and sunset for today
        logger.info('Sunrise and Sunset for today: ' + convertToLocalTime(results.sunrise, timeZone) + ', ' + convertToLocalTime(results.sunset, timeZone));

        // Get sunrise and sunset for today
        const sunriseToday = convertToLocalTime(results.sunrise, timeZone);
        const sunsetToday = convertToLocalTime(results.sunset, timeZone);

        // Calculate tomorrow's date
        const tomorrow = new Date(date);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDate = tomorrow.toISOString().split('T')[0]; // Format date as YYYY-MM-DD

        // Fetch sunrise and sunset for tomorrow
        const responseTomorrow = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0&date=${tomorrowDate}`);
        if (!responseTomorrow.ok) {
            throw new Error(`HTTP error! Status: ${responseTomorrow.status}`);
        }
        const dataTomorrow = await responseTomorrow.json();
        const resultsTomorrow = dataTomorrow.results;

        // Log the sunrise for tomorrow
        logger.info('Sunrise for tomorrow: ' + convertToLocalTime(resultsTomorrow.sunrise, timeZone));

        // Return today's and tomorrow's sunrise and sunset times
        return {
            sunriseToday,
            sunsetToday,
            sunriseTmrw: convertToLocalTime(resultsTomorrow.sunrise, timeZone),
        };
    } catch (error) {
        logger.error('Error fetching sun times: ' + error.message);
        return null;
    }
}

async function getSunTimesForCity(city, date) {
    logger.error('get sun times: ' + city);
    logger.error('get sun times2: ' + date);
    let coords = await fetchCoordinates(city);
    logger.error('get sun times3: ' + coords);
    if (coords) {
        const sunTimes = await fetchSunTimes(coords.lat, coords.lng, date, coords.timeZone);
        return {sunTimes,coords};
    }
    return null;
}

// Function to get the weekday name from a date
function getWeekday(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'long' };
    const week= date.toLocaleDateString('en-US', options);
    return week;
}

function getCurrentDateInTimeZone(timeZone) {
    const options = {
        timeZone: timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    };
    const formatter = new Intl.DateTimeFormat('en-GB', options);
    const [{ value: day },, { value: month },, { value: year }] = formatter.formatToParts(new Date());
    const date =`${day}-${month}-${year}`;
    return date;
}



// Function to fetch GeoName ID based on city
async function getGeoNameId(city) {
    const geoNamesUrl = `http://api.geonames.org/searchJSON?q=${city}&maxRows=1&username=ucs05`;
    try {
        const response = await axios.get(geoNamesUrl);
        if (response.data.geonames && response.data.geonames.length > 0) {
            return response.data.geonames[0].geonameId;
        } else {
            throw new Error('City not found');
        }
    } catch (error) {
        console.error("Error fetching GeoName ID:", error);
        throw error;
    }
}

// Route to fetch Muhurat data with dynamic city and date input
app.post('/fetch_muhurat', async (req, res) => {
    const { city, date } = req.body;  // Get city and date from the request body
    
    try {
        // Get the GeoName ID for the provided city
        const geoNameId = await getGeoNameId(city);

        // Format the URL to include the date and GeoName ID
        const url = `https://www.drikpanchang.com/muhurat/panchaka-rahita-muhurat.html?geoname-id=${geoNameId}&date=${date}`;
        
        // Fetch the HTML content from the website
        const response = await axios.get(url);
        
        // Load the HTML content using cheerio
        const $ = cheerio.load(response.data);
        
        // Extract the required data from the table
        const muhuratData = [];
        $('.dpMuhurtaRow').each((i, element) => {
            const muhurtaName = $(element).find('.dpMuhurtaName').text().trim();
            const muhurtaTime = $(element).find('.dpMuhurtaTime').text().trim();
            
            const [name, category] = muhurtaName.split(' - ');  // Split name and category
            
            muhuratData.push({
                muhurat: name,
                category: category || '',
                time: muhurtaTime
            });
        });
        
        // Return the data as JSON response
        res.json(muhuratData);
    } catch (error) {
        console.error("Error fetching Muhurat data:", error);
        res.status(500).send('Error fetching data');
    }
});

// Define routes
app.get('/api/fetchCoordinates/:city', async (req, res) => {
    const city = req.params.city;
    const coordinates = await fetchCoordinates(city);
    if (coordinates) {
        res.json(coordinates);
        
    }
    
    else {
        res.status(404).json({ error: 'Coordinates not found' });
    }
});

app.get('/api/fetchCityName/:lat/:lng', async (req, res) => {
    const { lat, lng } = req.params;
    // logger2.info("Lat and Lang given : "+ lat+ lng );
    const cityInfo = await fetchCityName(lat, lng);
    if (cityInfo) {
        // logger2.info("City Name Found: "+cityInfo);
        res.json(cityInfo);
    } else {
        res.status(404).json({ error: 'City name not found' });
    }
});

app.get('/api/convertToLocalTime', (req, res) => {
    const { utcDate, timeZone } = req.query;
    const localTime = convertToLocalTime(utcDate, timeZone);
    res.json({ localTime });
});

app.get('/api/fetchSunTimes/:lat/:lng/:date', async (req, res) => {
    const { lat, lng, date } = req.params;
    const timeZone = req.query.timeZone; // Pass timeZone as a query parameter
    const sunTimes = await fetchSunTimes(lat, lng, date, timeZone);
    if (sunTimes) {
        res.json(sunTimes);
    } else {
        res.status(404).json({ error: 'Sun times not found' });
    }
});

app.get('/api/getWeekday/:dateString', (req, res) => {
    const { dateString } = req.params;
    const weekday = getWeekday(dateString);
    res.json({ weekday });
});

app.get('/api/currentdateByTimeZone/:timezone', (req, res) => {
    const { timezone } = req.params;
    const datetoday = getCurrentDateInTimeZone(timezone);
    res.json({ datetoday });
});


app.get('/api/getSunTimesForCity/:city/:date', async (req, res) => {
    const { city, date } = req.params;
    const sunTimes = await getSunTimesForCity(city, date);
    if (sunTimes) {
        res.json(sunTimes);
    } else {
        res.status(404).json({ error: 'Sun times for city not found' });
    }
});

// Starting the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});
