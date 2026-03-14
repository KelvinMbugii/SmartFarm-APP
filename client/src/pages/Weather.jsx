// import React, { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import WeatherService from "@/services/WeatherService";
// import {
//   CloudSun,
//   Cloud,
//   Sun,
//   CloudRain,
//   Droplets,
//   Wind,
//   Eye,
//   Thermometer,
//   MapPin,
//   RefreshCw,
// } from "lucide-react";

// const Weather = () => {
//   const [weatherData, setWeatherData] = useState(null);
//   const [location, setLocation] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     fetchWeatherData();
//   }, []);

//   const fetchWeatherData = async () => {
//     setLoading(true);
//     setError("");

//     try {
//       const response = await fetch(
//         `/api/weather?location=${encodeURIComponent(location)}`
//       );

//       //const response = await WeatherService.getCurrentWeather();

//       if (response.ok) {
//         const data = await response.json();
//         setWeatherData(data);
//       } else {
//         setError("Failed to fetch weather data");
//       }
//     } catch (error) {
//       console.error("Error fetching weather:", error);
//       setError("Error fetching weather data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getWeatherIcon = (iconCode) => {
//     switch (iconCode) {
//       case "01d":
//         return <Sun className="w-8 h-8 text-yellow-500" />;
//       case "02d":
//         return <CloudSun className="w-8 h-8 text-yellow-500" />;
//       case "03d":
//       case "04d":
//         return <Cloud className="w-8 h-8 text-gray-500" />;
//       case "09d":
//       case "10d":
//         return <CloudRain className="w-8 h-8 text-blue-500" />;
//       default:
//         return <CloudSun className="w-8 h-8 text-yellow-500" />;
//     }
//   };

//   const getRecommendation = (weather) => {
//     const temp = weather.current.temperature;
//     const humidity = weather.current.humidity;
//     const wind = weather.current.windSpeed;

//     if (temp > 30) {
//       return {
//         text: "High temperature - Consider early morning or evening field work",
//         type: "warning",
//       };
//     } else if (temp < 5) {
//       return {
//         text: "Low temperature - Protect crops from frost",
//         type: "alert",
//       };
//     } else if (humidity > 80) {
//       return {
//         text: "High humidity - Monitor for plant diseases",
//         type: "info",
//       };
//     } else if (wind > 15) {
//       return {
//         text: "Strong winds - Avoid spraying operations",
//         type: "warning",
//       };
//     } else {
//       return {
//         text: "Good conditions for most agricultural activities",
//         type: "success",
//       };
//     }
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", {
//       weekday: "short",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-foreground">
//             Weather Information
//           </h1>
//           <p className="text-muted-foreground mt-2">
//             Get weather updates and farming recommendations
//           </p>
//         </div>
//       </div>

//       {/* Location Input */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-lg">Location</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="flex space-x-4">
//             <div className="flex-1">
//               <Input
//                 placeholder="Enter location (e.g., New York, London)"
//                 value={location}
//                 onChange={(e) => setLocation(e.target.value)}
//                 onKeyPress={(e) => e.key === "Enter" && fetchWeatherData()}
//               />
//             </div>
//             <Button
//               onClick={fetchWeatherData}
//               disabled={loading}
//               className="px-6"
//             >
//               {loading ? (
//                 <RefreshCw className="w-4 h-4 animate-spin" />
//               ) : (
//                 "Get Weather"
//               )}
//             </Button>
//           </div>
//         </CardContent>
//       </Card>

//       {error && (
//         <Card>
//           <CardContent className="text-center py-8">
//             <p className="text-red-600">{error}</p>
//           </CardContent>
//         </Card>
//       )}

//       {weatherData && (
//         <>
//           {/* Current Weather */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center space-x-2">
//                 <MapPin className="w-5 h-5" />
//                 <span>Current Weather - {location}</span>
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="flex items-center space-x-6">
//                   <div className="text-center">
//                     {getWeatherIcon(weatherData.current.icon)}
//                     <p className="text-sm text-muted-foreground mt-2">
//                       {weatherData.current.description}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-4xl font-bold text-primary">
//                       {Math.round(weatherData.current.temperature)}°C
//                     </p>
//                     <p className="text-muted-foreground">
//                       Feels like{" "}
//                       {Math.round(weatherData.current.temperature + 2)}°C
//                     </p>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="flex items-center space-x-2">
//                     <Droplets className="w-5 h-5 text-blue-500" />
//                     <div>
//                       <p className="text-sm text-muted-foreground">Humidity</p>
//                       <p className="font-semibold">
//                         {weatherData.current.humidity}%
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-center space-x-2">
//                     <Wind className="w-5 h-5 text-gray-500" />
//                     <div>
//                       <p className="text-sm text-muted-foreground">
//                         Wind Speed
//                       </p>
//                       <p className="font-semibold">
//                         {weatherData.current.windSpeed} m/s
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-center space-x-2">
//                     <Thermometer className="w-5 h-5 text-red-500" />
//                     <div>
//                       <p className="text-sm text-muted-foreground">Pressure</p>
//                       <p className="font-semibold">
//                         {weatherData.current.pressure} hPa
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-center space-x-2">
//                     <Eye className="w-5 h-5 text-purple-500" />
//                     <div>
//                       <p className="text-sm text-muted-foreground">
//                         Visibility
//                       </p>
//                       <p className="font-semibold">10 km</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Recommendation */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Agricultural Recommendation</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="flex items-center space-x-3">
//                 <Badge
//                   variant={
//                     getRecommendation(weatherData).type === "success"
//                       ? "default"
//                       : "secondary"
//                   }
//                   className={
//                     getRecommendation(weatherData).type === "warning"
//                       ? "bg-yellow-100 text-yellow-800"
//                       : getRecommendation(weatherData).type === "alert"
//                       ? "bg-red-100 text-red-800"
//                       : getRecommendation(weatherData).type === "info"
//                       ? "bg-blue-100 text-blue-800"
//                       : "bg-green-100 text-green-800"
//                   }
//                 >
//                   {getRecommendation(weatherData).type}
//                 </Badge>
//                 <p className="text-sm">{getRecommendation(weatherData).text}</p>
//               </div>
//             </CardContent>
//           </Card>

//           {/* 5-Day Forecast */}
//           <Card>
//             <CardHeader>
//               <CardTitle>5-Day Forecast</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//                 {weatherData.forecast.map((day, index) => (
//                   <div
//                     key={index}
//                     className="text-center p-4 rounded-lg border"
//                   >
//                     <p className="text-sm font-medium mb-2">
//                       {formatDate(day.date)}
//                     </p>
//                     <div className="flex justify-center mb-2">
//                       {getWeatherIcon(day.icon)}
//                     </div>
//                     <p className="text-lg font-semibold mb-1">
//                       {Math.round(day.temperature)}°C
//                     </p>
//                     <p className="text-xs text-muted-foreground mb-2">
//                       {day.description}
//                     </p>
//                     <div className="flex items-center justify-center space-x-1">
//                       <Droplets className="w-3 h-3 text-blue-500" />
//                       <span className="text-xs">{day.humidity}%</span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         </>
//       )}
//     </div>
//   );
// };

// export default Weather;


import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import WeatherService from "@/services/WeatherService";

import {
  CloudSun,
  Cloud,
  Sun,
  CloudRain,
  Droplets,
  Wind,
  Eye,
  Thermometer,
  MapPin,
  RefreshCw,
} from "lucide-react";

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [location, setLocation] = useState("New York");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    if (!location) return;

    setLoading(true);
    setError("");

    try {
      const data = await WeatherService.getWeather(location);
      setWeatherData(data);
    } catch (err) {
      console.error("Weather fetch error:", err);
      setError("Unable to fetch weather data");
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (iconCode) => {
    switch (iconCode) {
      case "01d":
        return <Sun className="w-8 h-8 text-yellow-500" />;
      case "02d":
        return <CloudSun className="w-8 h-8 text-yellow-500" />;
      case "03d":
      case "04d":
        return <Cloud className="w-8 h-8 text-gray-500" />;
      case "09d":
      case "10d":
        return <CloudRain className="w-8 h-8 text-blue-500" />;
      default:
        return <CloudSun className="w-8 h-8 text-yellow-500" />;
    }
  };

  const getRecommendation = (weather) => {
    const { temperature, humidity, windSpeed } = weather.current;

    if (temperature > 30) {
      return {
        text: "High temperature - Consider early morning or evening field work",
        type: "warning",
      };
    }

    if (temperature < 5) {
      return {
        text: "Low temperature - Protect crops from frost",
        type: "alert",
      };
    }

    if (humidity > 80) {
      return {
        text: "High humidity - Monitor for plant diseases",
        type: "info",
      };
    }

    if (windSpeed > 15) {
      return {
        text: "Strong winds - Avoid spraying operations",
        type: "warning",
      };
    }

    return {
      text: "Good conditions for most agricultural activities",
      type: "success",
    };
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <RefreshCw className="animate-spin w-6 h-6" />
      </div>
    );
  }

  const recommendation = weatherData
    ? getRecommendation(weatherData)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Weather Information</h1>
        <p className="text-muted-foreground">
          Get weather updates and farming recommendations
        </p>
      </div>

      {/* Location Input */}
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>

        <CardContent className="flex gap-4">
          <Input
            placeholder="Enter location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchWeatherData()}
          />

          <Button onClick={fetchWeatherData}>
            {loading ? <RefreshCw className="animate-spin w-4 h-4" /> : "Get Weather"}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card>
          <CardContent className="text-red-600 py-6 text-center">
            {error}
          </CardContent>
        </Card>
      )}

      {weatherData && (
        <>
          {/* Current Weather */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Current Weather - {weatherData.location}
              </CardTitle>
            </CardHeader>

            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  {getWeatherIcon(weatherData.current.icon)}
                  <p className="text-sm text-muted-foreground mt-2">
                    {weatherData.current.description}
                  </p>
                </div>

                <div>
                  <p className="text-4xl font-bold">
                    {weatherData.current.temperature}°C
                  </p>
                  <p className="text-muted-foreground">
                    Feels like {weatherData.current.temperature + 2}°C
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Stat icon={Droplets} label="Humidity" value={`${weatherData.current.humidity}%`} />
                <Stat icon={Wind} label="Wind Speed" value={`${weatherData.current.windSpeed} m/s`} />
                <Stat icon={Thermometer} label="Pressure" value={`${weatherData.current.pressure} hPa`} />
                <Stat icon={Eye} label="Visibility" value="10 km" />
              </div>
            </CardContent>
          </Card>

          {/* Recommendation */}
          <Card>
            <CardHeader>
              <CardTitle>Agricultural Recommendation</CardTitle>
            </CardHeader>

            <CardContent className="flex items-center gap-3">
              <Badge>{recommendation.type}</Badge>
              <p>{recommendation.text}</p>
            </CardContent>
          </Card>

          {/* Forecast */}
          <Card>
            <CardHeader>
              <CardTitle>5-Day Forecast</CardTitle>
            </CardHeader>

            <CardContent className="grid md:grid-cols-5 gap-4">
              {weatherData.forecast.map((day, index) => (
                <div key={index} className="text-center p-4 border rounded-lg">
                  <p className="text-sm font-medium">
                    {formatDate(day.date)}
                  </p>

                  <div className="flex justify-center my-2">
                    {getWeatherIcon(day.icon)}
                  </div>

                  <p className="font-semibold">
                    {day.temperature}°C
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {day.description}
                  </p>

                  <div className="flex justify-center gap-1 text-xs mt-2">
                    <Droplets className="w-3 h-3" />
                    {day.humidity}%
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

const Stat = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2">
    <Icon className="w-5 h-5 text-muted-foreground" />
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  </div>
);

export default Weather;