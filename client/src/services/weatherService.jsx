import api from "./api";

class WeatherService {
  async getCurrentWeather(location) {
    try {
      const { data } = await api.get("/api/weather", {
        params: { location },
      });

      return {
        temperature: Math.round(data.current.temperature),
        condition: data.current.description,
        humidity: data.current.humidity,
        windSpeed: data.current.windSpeed,
        icon: data.current.icon,
        location: location || "Current Location",
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
      const { data } = await api.get("/api/weather", {
        params: { location },
      });

      return (
        data.forecast?.slice(0, days).map((item) => ({
          date: item.date,
          temperature: Math.round(item.temperature),
          condition: item.description,
          humidity: item.humidity,
          icon: item.icon,
        })) || []
      );
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
