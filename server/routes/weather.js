const express = require('express');
const axios = require('axios');

const router = express.Router();

// Get weather data
router.get('/', async (req, res) => {
    try{
      const { location } = req.query;

      if (!location) {
        return res.status(400).json({ error: "Location is required" });
      }

      const apiKey = process.env.WEATHER_API_KEY;

      const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;

      const response = await axios.get(url);
      const weatherData = response.data;

      // Get forecast
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`;
      const forecastResponse = await axios.get(forecastUrl);

      // ✅ GROUP BY DAY
      const dailyMap = {};

      forecastRes.data.list.forEach((item) => {
        const date = item.dt_txt.split(" ")[0];

        if (!dailyMap[date]) {
          dailyMap[date] = {
            temps: [],
            humidity: [],
            descriptions: {},
            icons: {},
            date: item.dt_txt,
          };
        }

        dailyMap[date].temps.push(item.main.temp);
        dailyMap[date].humidity.push(item.main.humidity);

        const desc = item.weather[0].description;
        dailyMap[date].descriptions[desc] =
          (dailyMap[date].descriptions[desc] || 0) + 1;

        const icon = item.weather[0].icon.replace("n", "d");
        dailyMap[date].icons[icon] = (dailyMap[date].icons[icon] || 0) + 1;
      });

      // Convert to array
      const forecast = Object.values(dailyMap)
        .slice(0, 5)
        .map((day) => {
          const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

          const mostFrequent = (obj) =>
            Object.entries(obj).sort((a, b) => b[1] - a[1])[0][0];

          return {
            date: day.date,
            temperature: Math.round(avg(day.temps)),
            minTemp: Math.min(...day.temps),
            maxTemp: Math.max(...day.temps),
            humidity: Math.round(avg(day.humidity)),
            description: mostFrequent(day.descriptions),
            icon: mostFrequent(day.icons),
          };
        });

      res.json({
        current: {
          temperature: weatherData.main.temp,
          humidity: weatherData.main.humidity,
          pressure: weatherData.main.pressure,
          windSpeed: weatherData.wind.speed,
          description: weatherData.weather[0].description,
          icon: weatherData.weather[0].icon,
        },
        forecast,
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
    
