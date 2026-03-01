import React from 'react';
import { Droplets, Cloud } from 'lucide-react';

const WeatherCard = ({ weather }) => (
  <div className="weather-card">
    <div className="card-hover">
      <h2 className="card-title">Today's Weather</h2>
      <Cloud className="w-6 h-6 text-accent" />
    </div>
    <div className="weather-content">
      <div className="weather-main">
        <span className="weather-temp">{weather.temperature}</span>
        <span className="weather-condition">{weather.condition}</span>
      </div>
      <div className="weather-details">
        <div className="weather-item">
          <Droplets className="w-4 h-4" />
          <span>{weather.humidity}</span>
        </div>
      </div>
    </div>
  </div>
);

export default WeatherCard;
