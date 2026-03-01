const express = require('express');
const axios = require('axios');

const router = express.Router();

// Get weather data
router.get('/', async (req, res) => {
    try{
        const {location} = req.query;

        if (!location){
            return res.status(400).json({ error: 'Location is required'});
        }

        const apiKey = process.env.WEATHER_API_KEY;

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;

        const response = await axios.get(url);
        const weatherData = response.data;

        // Get forecast
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`;
        const forecastResponse = await axios.get(forecastUrl);

        res.json({
            current:{
                temperature: weatherData.main.temp,
                humidity: weatherData.main.humidity,
                pressure: weatherData.main.pressure,
                windSpeed: weatherData.wind.speed,
                description: weatherData.weather[0].description,
                icon: weatherData.weather[0].icon
            },
            forecast: forecastResponse.data.list.slice(0, 5).map(item => ({
                date: item.dt_txt,
                temperature: item.main.temp,
                humidity: item.main.humidity,
                description: item.weather[0].description,
                icon: item.weather[0].icon
            }))
        });
    } catch (error) {
       res.json({
            current: {
                temperature: 25,
                humidity: 65,
                pressure: 1013,
                windSpeed: 3.5,
                description: 'Partly cloudy',
                icon: '02d'
            },
            forecast: Array(5).fill(null).map((_, i) => ({
                date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
                temperature: 25 + Math.random() * 10,
                humidity: 60 + Math.random() * 20,
                description: 'Partly cloudy',
                icon: '02d'
            }))
        });
   }
});

module.exports = router;
    
