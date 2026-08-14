// import api from "./api";

// class WeatherService {
//   async getWeather(location) {
//     if (!location) {
//       throw new Error("Location is required");
//     }

//     try {
//       const { data } = await api.get("/api/weather", {
//         params: { location },
//       });

//       return this.normalizeWeatherData(data, location);
//     } catch (error) {
//       console.error("Weather API error:", error);
//       return this.getMockWeather(location);
//     }
//   }

//   normalizeWeatherData(data, location) {
//     const dailyForecast = this.groupByDay(data.forecast || []);

//     return {
//       location: location || "Current Location",

//       current: {
//         temperature: Math.round(data.current.temperature),
//         humidity: data.current.humidity,
//         pressure: data.current.pressure,
//         windSpeed: data.current.windSpeed,
//         description: data.current.description,
//         icon: data.current.icon,
//       },

//       forecast: dailyForecast,
//     };
//   }

//   getMockWeather(location) {
//     const days = 5;

//     return {
//       location: location || "Current Location",

//       current: {
//         temperature: 24,
//         humidity: 68,
//         pressure: 1013,
//         windSpeed: 12,
//         description: "Partly cloudy",
//         icon: "02d",
//       },

//       forecast: Array.from({ length: days }, (_, i) => ({
//         date: new Date(Date.now() + i * 86400000).toISOString(),
//         temperature: Math.round(24 + Math.random() * 10),
//         humidity: Math.round(65 + Math.random() * 20),
//         description: "Partly cloudy",
//         icon: "02d",
//       })),
//     };
//   }

//   getWeatherRecommendation({ temperature, humidity, windSpeed, description }) {
//     const condition = description?.toLowerCase() || "";

//     if (temperature > 35) {
//       return {
//         type: "warning",
//         message:
//           "Extreme heat - Avoid field work during midday. Ensure adequate irrigation.",
//         icon: "🌡️",
//       };
//     }

//     if (temperature < 5) {
//       return {
//         type: "alert",
//         message: "Frost warning - Protect sensitive crops and livestock.",
//         icon: "❄️",
//       };
//     }

//     if (humidity > 85) {
//       return {
//         type: "info",
//         message: "High humidity - Monitor crops for fungal diseases.",
//         icon: "💧",
//       };
//     }

//     if (windSpeed > 20) {
//       return {
//         type: "warning",
//         message: "Strong winds - Postpone spraying operations.",
//         icon: "💨",
//       };
//     }

//     if (condition.includes("rain")) {
//       return {
//         type: "info",
//         message: "Rain expected - Good for irrigation, delay harvesting.",
//         icon: "🌧️",
//       };
//     }

//     return {
//       type: "success",
//       message: "Ideal conditions for most agricultural activities.",
//       icon: "☀️",
//     };
//   }
// }

// export default new WeatherService();

import api from "./api";

class WeatherService {
  async getWeather(location) {
    if (!location) {
      throw new Error("Location is required");
    }

    try {
      const { data } = await api.get("/api/weather", {
        params: { location },
      });

      return this.normalizeWeatherData(data, location);
    } catch (error) {
      console.error("Weather API error:", error);
      return this.getMockWeather(location);
    }
  }

  normalizeWeatherData(data, location) {
    return {
      location: location || "Current Location",

      current: {
        temperature: Math.round(data.current.temperature),
        humidity: data.current.humidity,
        pressure: data.current.pressure,
        windSpeed: data.current.windSpeed,
        description: data.current.description,
        icon: this.normalizeIcon(data.current.icon),
      },

      forecast: this.groupByDay(data.forecast || []),
    };
  }

  /**
   * Group forecast into one entry per day
   * Prioritizes midday (12:00) data for accuracy
   */
  // groupByDay(forecastList) {
  //   const map = new Map();

  //   forecastList.forEach((item) => {
  //     const dateObj = new Date(item.date);
  //     const dayKey = dateObj.toDateString();
  //     const hour = dateObj.getHours();

  //     // Prefer midday data (12:00)
  //     if (!map.has(dayKey) || hour === 12) {
  //       map.set(dayKey, item);
  //     }
  //   });

  //   return Array.from(map.values())
  //     .slice(0, 5)
  //     .map((item) => ({
  //       date: item.date,
  //       temperature: Math.round(item.temperature),
  //       humidity: item.humidity,
  //       description: item.description,
  //       icon: this.normalizeIcon(item.icon),
  //     }));
  // }

  groupByDay(forecastList) {
    const days = {};

    forecastList.forEach((item) => {
      const dateObj = new Date(item.date);
      const dayKey = dateObj.toISOString().split("T")[0];

      if (!days[dayKey]) {
        days[dayKey] = {
          date: item.date,
          temps: [],
          humidity: [],
          descriptions: {},
          icons: {},
        };
      }

      days[dayKey].temps.push(item.temperature);
      days[dayKey].humidity.push(item.humidity);

      // count descriptions (to get most frequent)
      const desc = item.description;
      days[dayKey].descriptions[desc] =
        (days[dayKey].descriptions[desc] || 0) + 1;

      // count icons
      const icon = this.normalizeIcon(item.icon);
      days[dayKey].icons[icon] = (days[dayKey].icons[icon] || 0) + 1;
    });

    return Object.values(days)
      .slice(0, 5)
      .map((day) => {
        const avg = (arr) =>
          Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);

        const mostFrequent = (obj) =>
          Object.entries(obj).sort((a, b) => b[1] - a[1])[0][0];

        return {
          date: day.date,
          temperature: avg(day.temps), // or use min/max separately
          minTemp: Math.min(...day.temps),
          maxTemp: Math.max(...day.temps),
          humidity: avg(day.humidity),
          description: mostFrequent(day.descriptions),
          icon: mostFrequent(day.icons),
        };
      });
  }

  
  /**
   * Normalize icon (handle night icons like 01n → 01d)
   */
  normalizeIcon(icon) {
    if (!icon) return "02d";
    return icon.replace("n", "d");
  }

  getMockWeather(location) {
    const days = 5;

    return {
      location: location || "Current Location",

      current: {
        temperature: 24,
        humidity: 68,
        pressure: 1013,
        windSpeed: 12,
        description: "Partly cloudy",
        icon: "02d",
      },

      forecast: Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() + i * 86400000).toISOString(),
        temperature: Math.round(24 + Math.random() * 10),
        humidity: Math.round(65 + Math.random() * 20),
        description: "Partly cloudy",
        icon: "02d",
      })),
    };
  }

  getWeatherRecommendation({ temperature, humidity, windSpeed, description }) {
    const condition = description?.toLowerCase() || "";

    if (temperature > 35) {
      return {
        type: "warning",
        message:
          "Extreme heat - Avoid field work during midday. Ensure adequate irrigation.",
        icon: "🌡️",
      };
    }

    if (temperature < 5) {
      return {
        type: "alert",
        message: "Frost warning - Protect sensitive crops and livestock.",
        icon: "❄️",
      };
    }

    if (humidity > 85) {
      return {
        type: "info",
        message: "High humidity - Monitor crops for fungal diseases.",
        icon: "💧",
      };
    }

    if (windSpeed > 20) {
      return {
        type: "warning",
        message: "Strong winds - Postpone spraying operations.",
        icon: "💨",
      };
    }

    if (condition.includes("rain")) {
      return {
        type: "info",
        message: "Rain expected - Good for irrigation, delay harvesting.",
        icon: "🌧️",
      };
    }

    return {
      type: "success",
      message: "Ideal conditions for most agricultural activities.",
      icon: "☀️",
    };
  }
}

export default new WeatherService();