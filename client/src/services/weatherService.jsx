import axios from "axios";

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY || "demo-key";
const WEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

class WeatherService {
  async getCurrentWeather(location) {
    try {
      const response = await axios.get(`${WEATHER_BASE_URL}/weather`, {
        params: {
          q: location,
          appid: WEATHER_API_KEY,
          units: "metric",
        },
      });

      return {
        temperature: Math.round(response.data.main.temp),
        condition: response.data.weather[0].description,
        humidity: response.data.main.humidity,
        windSpeed: response.data.wind.speed,
        icon: response.data.weather[0].icon,
        location: response.data.name,
      };
    } catch (error) {
      console.error("Weather API error:", error);
      // Fallback to mock data
      return {
        temperature: 24,
        condition: "Partly cloudy",
        humidity: 68,
        windSpeed: 12,
        icon: "02d",
        location: location || "Current Location",
      };
    }
  }

  async getForecast(location, days = 5) {
    try {
      const response = await axios.get(`${WEATHER_BASE_URL}/forecast`, {
        params: {
          q: location,
          appid: WEATHER_API_KEY,
          units: "metric",
          cnt: days * 8, // 8 forecasts per day (3-hour intervals)
        },
      });

      // Group by day and take one forecast per day
      const dailyForecasts = [];
      const processedDates = new Set();

      response.data.list.forEach((item) => {
        const date = new Date(item.dt * 1000).toDateString();
        if (!processedDates.has(date) && dailyForecasts.length < days) {
          dailyForecasts.push({
            date: item.dt_txt,
            temperature: Math.round(item.main.temp),
            condition: item.weather[0].description,
            humidity: item.main.humidity,
            icon: item.weather[0].icon,
          });
          processedDates.add(date);
        }
      });

      return dailyForecasts;
    } catch (error) {
      console.error("Forecast API error:", error);
      // Fallback to mock data
      return Array(days)
        .fill(null)
        .map((_, i) => ({
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
          temperature: 24 + Math.random() * 10,
          condition: "Partly cloudy",
          humidity: 65 + Math.random() * 20,
          icon: "02d",
        }));
    }
  }

  getWeatherRecommendation(weatherData) {
    const { temperature, humidity, windSpeed, condition } = weatherData;

    if (temperature > 35) {
      return {
        type: "warning",
        message:
          "Extreme heat - Avoid field work during midday. Ensure adequate irrigation.",
        icon: "🌡️",
      };
    } else if (temperature < 5) {
      return {
        type: "alert",
        message: "Frost warning - Protect sensitive crops and livestock.",
        icon: "❄️",
      };
    } else if (humidity > 85) {
      return {
        type: "info",
        message: "High humidity - Monitor crops for fungal diseases.",
        icon: "💧",
      };
    } else if (windSpeed > 20) {
      return {
        type: "warning",
        message: "Strong winds - Postpone spraying operations.",
        icon: "💨",
      };
    } else if (condition.includes("rain")) {
      return {
        type: "info",
        message: "Rain expected - Good for irrigation, delay harvesting.",
        icon: "🌧️",
      };
    } else {
      return {
        type: "success",
        message: "Ideal conditions for most agricultural activities.",
        icon: "☀️",
      };
    }
  }
}

export default new WeatherService();
